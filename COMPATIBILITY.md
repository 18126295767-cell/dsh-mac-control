# Compatibility Matrix

This table separates the host runtime from the macOS capabilities used by this plugin.

| Component | Supported / verified | Notes |
| --- | --- | --- |
| macOS | 12 or newer; local verification on 26.5.2 | Required for `osascript`, Apple Automation, Accessibility, and Screen Recording. |
| Node.js | 20 or newer; local verification on v24.18.0 | Use the lockfile for repository development. |
| DeepSeek DSH CLI | `@deepseek-ai/dsh@0.1.0-rc.6` and `0.1.0-rc.7` verified | Commands in the guides pin `0.1.0-rc.7`. |
| DSH tools peer | `@deepseek-ai/dsh-tools >=0.1.0-rc.6 <0.2.0` | Supplied by the host; this package does not bundle a second DSH runtime. |
| Google Chrome | 151.0.7922.174 locally verified | Browser name is `Google Chrome`. |
| Safari | 26.5.2 locally verified | Browser name is `Safari`. |
| Windows / Linux | Not supported for this plugin | The official DSH Web runtime can run there, but these macOS control tools cannot. |

## Required permissions

Grant Automation, Accessibility, and Screen Recording to the actual process that starts DSH. A permission granted to Terminal does not necessarily grant it to a separately launched Node process or native app.

## Feature boundary

Read-only browser tab listing and desktop inspection are portable at the API level but execute only on macOS. Opening or navigating a browser, activating apps, typing, key presses, and clicks are mutating actions and are approval-gated by default.

