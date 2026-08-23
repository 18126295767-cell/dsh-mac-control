# 掘金教程草稿

## 让 DeepSeek Harness 处理“当前页面”：一个可复现的 Mac 本地控制插件

### 真实问题

模型能规划“打开页面、点击按钮、切换 App”，却看不到你当前的 Chrome/Safari 标签页，也不能确认桌面上的控件。

### 实现方式

`dsh-mac-control` 注册两个工具：`mac_browser` 使用 macOS JXA 读取/控制 Safari 和 Chrome，`mac_desktop` 使用 System Events、`open` 和 `screencapture` 读取应用、窗口、辅助功能树并截图。插件不启动 HTTP 服务，也不代理浏览器流量；所有输入先校验，变更动作默认走 DSH approval gate。

### 复现

安装 Node.js 20+ 和官方 DSH，固定 `@deepseek-ai/dsh@0.1.0-rc.7`，从 GitHub commit archive 安装 `dsh-mac-control@0.1.0`，再运行 `--dump-config`。先执行只读的 `list_tabs` 与 `frontmost_app`，最后按需授予 Automation、Accessibility、Screen Recording。

### 边界

不把密码、Cookie、API Key 放进工具参数；URL 只接受 `http`/`https`。Windows/Linux 仅支持官方 Web runtime，不支持本插件的 macOS 控制。

代码、测试和教程：https://github.com/18126295767-cell/dsh-mac-control

