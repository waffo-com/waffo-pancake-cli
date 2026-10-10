import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { npm } from "./lib.mjs";

mkdirSync("artifacts", { recursive: true });
const [packed] = JSON.parse(npm(["pack", "--json", "--ignore-scripts", "--pack-destination", "artifacts"]));
for (const file of packed.files) {
  if (!/^(dist\/index\.js|package\.json|README\.md|SKILL\.md|LICENSE)$/.test(file.path)) {
    throw new Error(`Unexpected published file: ${file.path}`);
  }
}
for (const required of ["dist/index.js", "package.json", "README.md", "SKILL.md", "LICENSE"]) {
  if (!packed.files.some(file => file.path === required)) throw new Error(`Missing ${required}`);
}
if (!readFileSync("dist/index.js", "utf8").startsWith("#!/usr/bin/env node")) throw new Error("Missing CLI shebang");
const bytes = readFileSync(`artifacts/${packed.filename}`);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
writeFileSync("artifacts/package.json", JSON.stringify({ filename: packed.filename, version: packed.version, sha256, integrity }, null, 2) + "\n");
writeFileSync("artifacts/SHA256SUMS", `${sha256}  ${packed.filename}\n`);
console.log(`Packed ${packed.filename}; allowlist and executable entry verified.`);
