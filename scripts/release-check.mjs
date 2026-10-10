import { appendFileSync, readFileSync } from "node:fs";
import { releaseVersion } from "./lib.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const channel = releaseVersion(pkg, process.env.GITHUB_REF_NAME || process.argv[2]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
if (lock.version !== pkg.version || lock.packages[""].version !== pkg.version) throw new Error("Lockfile version mismatch");
if (!readFileSync("CHANGELOG.md", "utf8").includes(`## ${pkg.version}\n`)) throw new Error("Add this version to CHANGELOG.md");
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `channel=${channel}\nversion=${pkg.version}\n`);
console.log(`Release checks passed: ${pkg.version} (${channel})`);
