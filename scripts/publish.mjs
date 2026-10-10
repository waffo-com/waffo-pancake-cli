import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { npm, releaseVersion } from "./lib.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const channel = releaseVersion(pkg, process.env.GITHUB_REF_NAME);
const artifact = JSON.parse(readFileSync("artifacts/package.json", "utf8"));
if (artifact.version !== pkg.version) throw new Error("Artifact version mismatch");
const archive = `artifacts/${artifact.filename}`;
const integrity = `sha512-${createHash("sha512").update(readFileSync(archive)).digest("base64")}`;
if (integrity !== artifact.integrity) throw new Error("Local artifact integrity mismatch");
const endpoint = `https://registry.npmjs.org/@waffo%2Fpancake-cli/${pkg.version}`;

async function readPublished() {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`npm registry read failed: ${response.status}`);
  return response.json();
}

let published = await readPublished();
if (channel === "latest") {
  const currentResponse = await fetch("https://registry.npmjs.org/@waffo%2Fpancake-cli/latest", { signal: AbortSignal.timeout(30000) });
  if (currentResponse.status !== 404) {
    if (!currentResponse.ok) throw new Error(`npm latest read failed: ${currentResponse.status}`);
    const current = await currentResponse.json();
    const oldParts = current.version.split(".").map(Number);
    const newParts = pkg.version.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (newParts[i] < oldParts[i]) throw new Error("Refusing to move npm latest backwards");
      if (newParts[i] > oldParts[i]) break;
    }
  }
}
if (!published) {
  console.log(npm(["publish", archive, "--ignore-scripts", "--access", "public", "--tag", channel]));
  for (let attempt = 0; attempt < 6 && !published; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    published = await readPublished();
  }
}
if (published?.dist?.integrity !== integrity) throw new Error("Published version is missing or has different bytes; never overwrite/reuse the version.");
console.log(`Verified npm ${pkg.name}@${pkg.version}. Identical reruns are safe.`);
