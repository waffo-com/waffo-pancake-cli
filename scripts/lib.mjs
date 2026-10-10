import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
}

function npmEntry() {
  if (process.env.npm_execpath?.endsWith(".js")) return process.env.npm_execpath;
  for (const dir of [dirname(process.execPath), ...(process.env.PATH || "").split(delimiter)]) {
    const candidate = process.platform === "win32"
      ? join(dir, "node_modules/npm/bin/npm-cli.js") : join(dir, "npm");
    if (existsSync(candidate)) return realpathSync(candidate);
  }
  throw new Error("npm CLI not found on PATH");
}

export function npm(args, options = {}) {
  return run(process.execPath, [npmEntry(), ...args], options);
}

export function releaseVersion(pkg, tag) {
  if (pkg.private) throw new Error("Package is private; finish product acceptance before enabling publication.");
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.(0|[1-9]\d*))?$/.test(pkg.version)) {
    throw new Error("Expected stable semver or alpha.N/beta.N/rc.N prerelease");
  }
  if (pkg.version === "0.0.0") throw new Error("The scaffold version cannot be released");
  if (tag !== `v${pkg.version}`) throw new Error("Release tag must match package.json version");
  return pkg.version.includes("-") ? "next" : "latest";
}
