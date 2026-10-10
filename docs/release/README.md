# Release setup and operations

## Current state

CI/CD infrastructure is implemented. The CLI still only provides help/version. `private: true` and version `0.0.0` intentionally block publishing the scaffold. No npm package or working public Homebrew formula is claimed until a real release passes the complete flow.

## Repositories and channels

| Channel | Location | Update method |
| --- | --- | --- |
| Source / GitHub release | `waffo-com/waffo-pancake-cli` | Push reviewed `vX.Y.Z` tag |
| npm / npx | `@waffo/pancake-cli` | GitHub Actions OIDC |
| Homebrew | `waffo-com/homebrew-pancake` | Poll npm stable every six hours; manual dispatch also available |

Both repositories are public. Internal PRDs stay local under ignored `docs/prd/`; do not force-add them. npm publishes only the allowlisted executable, manifest, README, license and SKILL reference.

## One-time setup

1. Finish business feature acceptance. Update README/SKILL so installation documentation matches real commands. Remove `private: true` only when ready to publish.
2. A maintainer with npm `@waffo` publishing rights must establish the package. This machine is not authenticated to npm. Do not put npm tokens in the repository or ask users to paste them into chat.
3. If npm requires an initial authenticated publish before package-level trusted-publisher settings are available, publish the first tested archive from a maintainer session using `npm login` and `npm publish artifacts/<archive>.tgz --access public --tag next`. Use a prerelease for bootstrap; do not publish an empty placeholder to reserve the name. That initial manual publication does not carry CI provenance.
4. Configure the package's npm Trusted Publisher:
   - Organization: `waffo-com`
   - Repository: `waffo-pancake-cli`
   - Workflow filename: `release.yml`
   - Environment: `npm`
   - Allow direct `npm publish` (stage-only permission is insufficient for this workflow).
5. Create GitHub environment `npm`. Release uses GitHub-hosted Ubuntu and Node 24 with npm >=11.5.1. Public-repository OIDC publishes generate npm provenance automatically. No persistent npm publish token is required.
6. Restrict who may create release tags. Protect main with required CI checks and normal code review according to organization policy. The Homebrew updater currently writes its tested formula to main; do not require a PR there without adapting that workflow.
7. Verify Actions are enabled for both repositories. Tap update job needs contents-write; no token granting access to the CLI repository is needed.

Official references: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm provenance](https://docs.npmjs.com/generating-provenance-statements/). npm settings and first-publish behavior must be verified against the account at setup time. New trusted-publisher configurations currently expire if not successfully used within two days.

## Normal release

1. Bump package and lockfile together with `npm version <version> --no-git-tag-version`.
2. Add a `## <version>` heading and release notes to CHANGELOG. Version must be stable semver or `alpha.N`, `beta.N`, `rc.N`.
3. Run `npm ci`, `npm run check`, `npm run pack:release`, `npm run test:package`; inspect the archive allowlist and public documentation.
4. Commit/review/merge to main. Tag that exact commit: `git tag v<version>` then `git push origin v<version>`.
5. Release workflow validates version/tag/changelog/main ancestry, runs the six OS/Node checks and publishes the Ubuntu Node 24 archive. It never rebuilds a different package in the publishing job.
6. Confirm npm publication and GitHub release archive/checksum. Stable versions publish under `latest`; prereleases publish under `next`.
7. Homebrew detects stable `latest`, verifies SHA-512 from npm, calculates SHA-256 and installs/tests on both supported OSes before committing the formula. For immediate update: `gh workflow run update.yml --repo waffo-com/homebrew-pancake`.

The workflow relies on npm's OIDC setup. A green local test cannot prove remote publication works. Verify a real prerelease from Actions after credentials/trust are configured.

## Failure and recovery

- **Checks fail:** no npm publish occurs. Fix on main and use the normal review flow.
- **Publish returns an uncertain result:** inspect npm first. Rerunning the same tag is supported only when registry integrity equals the tested archive. A different archive at that version is a hard failure; publish a new version.
- **npm succeeded, GitHub release failed:** rerun failed jobs. Identical npm content is recognized; GitHub draft release assets are uploaded before publication. Already-public GitHub releases are left unchanged.
- **Homebrew update fails:** existing formula remains installed/published. Correct the cause and rerun `update.yml`; do not hand-edit its hash.
- **Bad product version:** ship a corrected patch release. Do not reuse versions, force-move tags or overwrite a published npm archive. Deprecate an affected npm version as a separate, explicit maintainer operation if needed.
- **Older tag would move `latest` backwards:** the publisher refuses this. A deliberate channel rollback is a separate maintainer decision, not an automatic rerun.

## Verification coverage

- Actual packed-file allowlist and shebang checks.
- npm exec/npx mechanism and installed global binary in isolated directories.
- Node 22/24 on macOS, Linux and Windows.
- Tag/scaffold gates and stable/prerelease separation.
- Formula rejects altered bytes, wrong package/origin and prereleases; updater refuses downgrades.
- Homebrew style, installation and formula tests on macOS/Linux when a stable package exists.

Before first publication, the tap intentionally has no real formula. Tap CI builds the actual CLI source and installs its local archive through a temporary formula on macOS/Linux. Registry-to-Homebrew installation remains pending the first stable release.
