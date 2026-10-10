import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { run } from "./lib.mjs";

const tag = process.env.GITHUB_REF_NAME;
const meta = JSON.parse(readFileSync("artifacts/package.json", "utf8"));
if (tag !== `v${meta.version}`) throw new Error("Tag/archive mismatch");
const view = spawnSync("gh", ["release", "view", tag, "--json", "isDraft"], { encoding: "utf8" });
if (view.status !== 0) {
  run("gh", ["release", "create", tag, "--verify-tag", "--draft", "--title", tag, "--generate-notes"]);
} else if (!JSON.parse(view.stdout).isDraft) {
  console.log("GitHub release is already published; leaving its assets unchanged.");
  process.exit(0);
}
run("gh", ["release", "upload", tag, `artifacts/${meta.filename}`, "artifacts/SHA256SUMS", "--clobber"]);
run("gh", ["release", "edit", tag, "--draft=false", ...(meta.version.includes("-") ? ["--prerelease"] : ["--latest"])]);
console.log(`Published GitHub release ${tag}`);
