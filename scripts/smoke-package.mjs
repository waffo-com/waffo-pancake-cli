import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { npm, run } from "./lib.mjs";

const metadata = JSON.parse(readFileSync("artifacts/package.json", "utf8"));
const archive = resolve("artifacts", metadata.filename);
const temp = mkdtempSync(join(tmpdir(), "pancake-package-"));
try {
  // Separate cache and prefix: exercise the archive, not a workspace/global install.
  const env = { ...process.env, npm_config_cache: join(temp, "cache"), npm_config_update_notifier: "false" };
  const output = npm(["exec", "--yes", `--package=${archive}`, "--", "pancake", "--version"], { cwd: temp, env });
  assert.equal(output.trim(), metadata.version);
  assert.match(npm(["exec", "--yes", `--package=${archive}`, "--", "pancake", "--help"], { cwd: temp, env }), /Usage: pancake/);
  const prefix = join(temp, "global");
  npm(["install", "--global", "--prefix", prefix, "--ignore-scripts", "--no-audit", "--no-fund", archive], { cwd: temp, env });
  const bin = process.platform === "win32" ? join(prefix, "pancake.cmd") : join(prefix, "bin/pancake");
  const installed = process.platform === "win32"
    ? run("cmd.exe", ["/d", "/s", "/c", `""${bin}" --version"`], { cwd: temp, env, windowsVerbatimArguments: true })
    : run(bin, ["--version"], { cwd: temp, env });
  assert.equal(installed.trim(), metadata.version);
  console.log("Packed archive: npm exec (npx) and global executable passed.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
