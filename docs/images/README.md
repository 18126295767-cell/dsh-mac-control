# Screenshot Record

These public documentation images show the official DSH Web host on macOS and
Windows plus the independent native macOS shell. A host plugin-inventory image
does not by itself prove this package is registered; registration is verified
separately with `--dump-config` and tests.

| File | Source | Pixels | SHA-256 |
| --- | --- | ---: | --- |
| `macos-dsh-home.png` | Official `@deepseek-ai/dsh` Web runtime at local `127.0.0.1:3080` in an isolated browser viewport | 1600x900 | `1bd14f4473810d873077e6b44d506dfab4a10ffa27949c1698ff8f78f6c3d32a` |
| `macos-app-home.png` | Independent AppKit/WebKit shell displaying the same local `web` profile | 1281x768 | `2e342ee327feaeeb1fbe93350051073febc9fa3854456e6e0092f471096b748b` |
| `../demo/dsh-mac-control-20s.gif` | Privacy-safe status timeline rendered with the real plugin registration plus sanitized, offline tab fixtures; Calculator click, TextEdit activation, and screenshot are shown as local fixtures | 2400x1500, 40 frames, 20 seconds | `63b05a3d3f6f4227df5aebc1ca7820b9cf16d5dc2398f29bf02f3238ebfebff7` |
| `../demo/dsh-mac-control-tabs-read.png` | Status frame after sanitized offline `mac_browser.list_tabs` fixtures; no existing Chrome/Safari session is inspected | 2400x1500 | `f8a9bba374db837ef37e93dda67017a3e726fccd3b4bcfbc9f654600e8e252ee` |
| `../demo/dsh-mac-control-button-clicked.png` | Status frame after a sanitized offline click fixture | 2400x1500 | `cad2105eaf6b1b99b1a22019b3a197f40b0230b05ba3beaa6aae0b86fcbaf3cf` |
| `../demo/dsh-mac-control-screenshot.png` | Status frame after a sanitized offline app-switch and screenshot fixture | 2400x1500 | `27db903f14bd963f4d9114d50297b1f9a836bf7c56eb4793a621d7c1d47f8e41` |
| `windows-01-developer-preview.png` | Official DSH developer-preview notice on GitHub Actions `windows-2025` | 1600x1000 | `654600d8acf83ae594d030182bdb542ea0c856074051771727c26460776679a7` |
| `windows-02-api-key-onboarding.png` | Official DSH onboarding with an empty API-key field on `windows-2025` | 1600x1000 | `9f18a256695951ccd5a2c53931a3f1beb56f54546f32bec97684426d8c14ff1d` |
| `windows-03-empty-workspace.png` | Official DSH empty workspace on `windows-2025` | 1600x1000 | `7ae5f0587f09bfd75b6f586bdd2309b05f80a4a824ae664a9f1b051f67d46825` |
| `windows-04-model-settings.png` | Official DSH model settings with an empty API-key field on `windows-2025` | 1600x1000 | `c29b6e50e3ddaff41eedb44890ef051a03bc70a504c0249451cd5bf109e47980` |
| `windows-05-plugin-inventory.png` | Official DSH plugin inventory on `windows-2025` | 1600x1000 | `e5fbc24b1715e3bd509b476cc99e907d7fcd8ac3aba589dd907867b4c8006351` |

All files preserve their source PNG bytes. They were visually reviewed for
accounts, credentials, API keys, sessions, private paths, and personal content.
Do not convert them to JPEG, upscale them, or replace them with screenshots
from a signed-in browser profile.

The demo assets are not screenshots of the user's browser or desktop. The
script loads the real plugin registration, uses deterministic sanitized tab and
desktop fixtures by default, and renders only a localhost status page in a
temporary headless Chrome profile. This prevents accounts, notifications, open
documents, and browser sessions from entering the assets. An opt-in
`DSH_DEMO_LIVE_ACTIONS=1` mode exists for a developer's own machine, but it is
not used to create the checked-in public assets.

Reproduce the assets on macOS with:

```sh
npm ci --ignore-scripts
npm run demo:record
```

The recorder uses a random loopback port and a temporary headless Chrome
profile. The checked-in recording exercises the same tool sequence as offline
fixtures: tab listing, a safe button click, app activation, and screenshot.
No current Chrome/Safari tabs or desktop pixels are read.

The Windows files were generated in
[GitHub Actions run 32463733955](https://github.com/18126295767-cell/deepseek-harness-macos-app/actions/runs/32463733955)
from App candidate commit `a46c7279cf742c4fa82d3291016cc6fc66f445f1`.
The job used Windows x64, requested runner label `windows-2025`, image
`win25-vs2026`, and a fresh non-persistent Playwright context restricted to
loopback `127.0.0.1:3080`.

The checked-in [`windows-screenshot-proof.json`](windows-screenshot-proof.json)
preserves the runner evidence, dimensions, byte sizes, and hashes. Every API-key
field is blank. A local Vision OCR scan found only public DSH UI copy and plugin
names; manual review found no account, credential, cookie, private path,
session, workspace content, or personal information. These screenshots prove
the Windows DSH host only, not Windows support for this macOS control plugin.
