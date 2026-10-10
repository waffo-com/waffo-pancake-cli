---
name: waffo-pancake-cli
description: Installation and current capability reference for the Waffo Pancake developer CLI.
---

# Waffo Pancake CLI

Status: development scaffold. Only `--help` and `--version` exist. No public npm release is available yet. Product creation, login and webhook commands are not implemented.

## Installation after the first public release

Choose one method. npm/npx require Node.js >=22.14; Homebrew installs Node.

```sh
# Homebrew (macOS/Linux)
brew tap waffo-com/pancake
brew install waffo-com/pancake/pancake
pancake --help

# npm (macOS/Linux/Windows)
npm install -g @waffo/pancake-cli
pancake --help

# npx, without a global installation
npx @waffo/pancake-cli --help
```

For repeatable automation, pin a published version: `npx @waffo/pancake-cli@<version> --help`. Replace the placeholder with an actual published version.

## Current development use

```sh
npm ci
npm run check
node dist/index.js --help
```

Read CLI help for supported commands. Update this document when business features are implemented; do not infer available commands, endpoints or successful operations from a roadmap.
