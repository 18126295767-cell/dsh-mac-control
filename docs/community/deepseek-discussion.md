# DeepSeek Harness Discussions draft

## Title

Make DeepSeek Harness inspect a real Chrome/Safari tab and Mac app without handing it your credentials

## Body

The real problem: DSH can reason about a task, but it cannot see the browser tab or desktop control that the task is about. `dsh-mac-control` adds two local tools: `mac_browser` reads Safari/Chrome tabs and `mac_desktop` inspects apps, windows, controls, and screenshots.

The reproducible path is intentionally boring: install the official `@deepseek-ai/dsh@0.1.0-rc.7`, add this repository at a reviewed commit, run `--dump-config`, and test `list_tabs` plus `frontmost_app` before enabling mutations. macOS Automation, Accessibility, and Screen Recording are granted to the process that starts DSH. Mutations ask for approval by default.

Security boundary: no HTTP server, browser proxy, credential storage, cookies, or secret arguments. Browser URLs are limited to `http` and `https`. Windows/Linux can run the official Web runtime, but these tools are macOS-only.

Repository and step-by-step tutorial: https://github.com/18126295767-cell/dsh-mac-control

