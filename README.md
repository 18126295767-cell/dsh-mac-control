# Give DeepSeek Harness Hands on Your Mac

Turn a local DeepSeek Harness session into a practical Mac operator: inspect a browser tab, open a page, switch apps, read accessible controls, type, press keys, click, and capture the screen through two focused tools.

`dsh-mac-control` is a native DSH bundle for macOS. It adds:

- `mac_browser` for Safari and Google Chrome tabs.
- `mac_desktop` for local macOS applications and screenshots.

The design is intentionally small and local. The plugin does not start an HTTP server, proxy browser traffic, or store credentials. It passes validated requests to macOS `osascript` (JXA/System Events), `open`, and `screencapture`; macOS remains responsible for Automation, Accessibility, and Screen Recording permissions.

## Install

```sh
dsh plugin --profile web add dsh-mac-control
```

Restart the web profile, then ask the agent to use `mac_browser` or `mac_desktop`. On first use, approve the macOS permission prompts for the DeepSeek Harness process.

## Safety Defaults

Browser URLs are limited to `http` and `https`. Browser and desktop targets are allowlisted by configuration. Tool inputs reject oversized text and invalid coordinates. The tool descriptions explicitly tell the model not to send passwords, API keys, cookies, or recovery codes.

For an approval prompt before UI-changing actions, add this profile override:

```yaml
- id: mac-control
  config:
    browsers: [Safari, Google Chrome]
    screenshotDirectory: ~/.dsh/mac-control/screenshots
    requireApproval: true
    maxUiItems: 120
```

## License

MIT
