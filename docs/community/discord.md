# Discord tutorial draft

**Problem:** “The model knows what I should do, but it cannot read the tab or button in front of me.”

**Fix:** `dsh-mac-control` exposes `mac_browser` and `mac_desktop` to the official DeepSeek Harness runtime. Start with read-only calls:

```text
mac_browser: action=list_tabs, browser=Google Chrome
mac_desktop: action=frontmost_app
```

Then add the plugin from a reviewed GitHub commit, grant the three macOS permissions to the actual DSH process, and keep approval enabled for clicks, typing, navigation, and app switching. It does not store credentials or proxy browser traffic. Full reproduction and the Windows boundary are documented here: https://github.com/18126295767-cell/dsh-mac-control

