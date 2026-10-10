import assert from "node:assert/strict";
import test from "node:test";
import { releaseVersion } from "./lib.mjs";

test("release gates refuse scaffold, mismatched tag and malformed versions", () => {
  for (const [pkg, tag] of [
    [{ private: true, version: "1.0.0" }, "v1.0.0"],
    [{ version: "0.0.0" }, "v0.0.0"],
    [{ version: "1.2.3" }, "v1.2.4"],
    [{ version: "01.2.3" }, "v01.2.3"],
    [{ version: "1.2.3-rc.01" }, "v1.2.3-rc.01"],
  ]) assert.throws(() => releaseVersion(pkg, tag));
});
test("prereleases never publish to latest", () => {
  assert.equal(releaseVersion({ version: "1.2.3" }, "v1.2.3"), "latest");
  for (const kind of ["alpha", "beta", "rc"]) {
    const version = `1.2.3-${kind}.1`;
    assert.equal(releaseVersion({ version }, `v${version}`), "next");
  }
});
