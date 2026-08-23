# Contributing

Thanks for helping improve `dsh-mac-control`. This project is a small, macOS-only DeepSeek Harness plugin. Contributions should keep the local-control boundary explicit and reproducible.

## Before opening an issue or pull request

- Read [SECURITY.md](SECURITY.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).
- Do not include passwords, API keys, cookies, recovery codes, browser profiles, private screenshots, or personal paths in issues, commits, tests, or recordings.
- Reproduce changes with Node.js 20+ and a clean checkout.

```sh
npm ci --ignore-scripts
npm test
npm pack --dry-run --json
```

## Pull requests

Keep pull requests focused. Describe the user problem, the observable behavior, the macOS permissions involved, and how you tested it. Changes to browser or desktop mutations must preserve approval-by-default behavior and input validation.

Mac integration tests may require a real macOS session and permissions; keep portable unit tests offline and deterministic. Do not add tests that depend on a signed-in browser or a live model provider.

## Release-facing changes

Update the README, tutorials, compatibility matrix, and tests when public commands, supported host versions, permissions, or security behavior change. Package metadata and the MIT license must remain consistent.

