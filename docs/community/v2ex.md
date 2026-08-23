# V2EX tutorial draft

## 让 DeepSeek Harness 看见你正在处理的页面，而不是把账号交给脚本

很多自动化失败不是模型不会推理，而是它不知道当前 Chrome/Safari 标签页和桌面窗口的真实状态。我做了一个 macOS-only DSH 插件，把这个缺口拆成两个可审计工具：`mac_browser` 只负责读取和选择标签页，`mac_desktop` 负责应用、窗口、辅助功能树和截图。

复现时先固定官方 `@deepseek-ai/dsh@0.1.0-rc.7`，再用完整 commit URL 安装 `dsh-mac-control@0.1.0`。先跑 `--dump-config`、`list_tabs`、`frontmost_app`，确认后才尝试点击或导航。Automation、Accessibility、Screen Recording 必须授予真正启动 DSH 的进程。

安全边界很明确：不启动 HTTP server，不做代理，不接受密码、Cookie、API Key；URL 只允许 `http`/`https`，变更默认需要确认。Windows 可以跑官方 Web runtime，但本插件不提供 Windows 控制能力。

完整教程和测试：https://github.com/18126295767-cell/dsh-mac-control

