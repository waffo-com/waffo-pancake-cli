# Waffo Pancake CLI

Developer CLI for Waffo Pancake, built with TypeScript, Node.js and Commander.

**Status: development scaffold.** Only help/version are implemented. Product management and local webhook tools are planned. No public npm version is released yet; installation commands below become available after the first release. This is separate from the Pancake migration CLI.

## Installation (after release)

### Homebrew — macOS/Linux

```sh
brew tap waffo-com/pancake
brew install waffo-com/pancake/pancake
pancake --help
```

Homebrew installs Node.js. The qualified formula name avoids tap conflicts; `brew install pancake` works when unambiguous.

### npm — macOS/Linux/Windows

Requires Node.js >=22.14.

```sh
npm install -g @waffo/pancake-cli
pancake --help
```

### npx — without a global installation

```sh
npx @waffo/pancake-cli --help
```

Pin a published version for repeatable automation. Prereleases use npm's `next` tag and never update stable Homebrew.

## Development

```sh
npm ci
npm run check
npm run pack:release
npm run test:package
```

Package smoke tests install the actual tarball in isolated directories and exercise npm exec (the npx mechanism) and the global executable. No merchant credentials are needed.

## CI/CD

- PR/main: type checking, tests, build, audit, archive allowlist and npx/global installation on macOS/Linux/Windows with Node 22 and 24.
- Version tags: validate tag/version/changelog and main ancestry, rerun checks, publish the tested archive via npm OIDC, verify registry integrity, create a GitHub release with the same archive/checksum.
- Homebrew: the [tap](https://github.com/waffo-com/homebrew-pancake) detects stable npm versions, verifies integrity and tests installation before updating.
- Weekly Dependabot updates cover dependencies and pinned Actions.

See [release setup and recovery](docs/release/README.md), [agent reference](SKILL.md) and [changelog](CHANGELOG.md).

Internal planning documents are maintained outside the public repository. The package remains `private: true` until its first product release is ready.

## Upgrade and uninstall (after release)

```sh
npm install -g @waffo/pancake-cli@latest
npm uninstall -g @waffo/pancake-cli
# Or Homebrew:
brew update
brew upgrade waffo-com/pancake/pancake
brew uninstall waffo-com/pancake/pancake
```

MIT license.
