# B 站视频文案草稿

## 标题

让 DeepSeek Harness 读 Chrome 标签页、点 Mac 按钮：默认确认、可复现的本地插件

## 口播/简介

这个视频解决一个具体问题：模型知道下一步该做什么，但不知道当前浏览器和桌面是什么状态。我们用官方 DeepSeek Harness 加入 `dsh-mac-control@0.1.0`，演示读取 Chrome/Safari 标签页、读取辅助功能树、点击一个安全的本地按钮、切换 App、保存截图。

演示使用隔离的 localhost 页面，不登录账号，不读取 Cookie，不输入凭据。插件不启动 HTTP 服务、不做代理，URL 只允许 `http`/`https`，点击、输入、导航等变更默认需要确认。macOS 需要把 Automation、Accessibility、Screen Recording 给真正启动 DSH 的进程。Windows 可运行官方 Web runtime，但本插件的控制工具是 macOS-only。

复现命令和源码：https://github.com/18126295767-cell/dsh-mac-control

