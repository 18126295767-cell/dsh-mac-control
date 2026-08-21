# DeepSeek Harness Mac Control 教程

本教程提供两条经过验证的配置路径：

1. **DeepSeek 官方 DSH runtime**：使用 DeepSeek AI 发布的 `@deepseek-ai/dsh` CLI 和 Web profile。
2. **本地 macOS 桌面外壳**：把同一个官方 DSH Web profile 显示为原生 AppKit/WebKit 窗口。

桌面外壳不是另一套插件系统，也不是 DeepSeek AI 官方独立桌面产品；它启动或连接本机的 `dsh web` 服务，并加载同一个 `~/.dsh/profiles/web` profile。因此插件只需要安装一次。

`deepseek-harness-ultimate` 是一个独立的社区维护扩展 profile，可选择使用，但不是 DeepSeek 官方发行，也不会自动替代本教程中的 `web` profile。

## 0. 前置条件

- macOS；本插件会调用 Safari、Google Chrome、`osascript`、辅助功能和截图 API。
- Node.js 20 或更高版本。若使用 `deepseek-harness-ultimate`，其自身要求 Node.js 22 或更高版本。
- Git 与 pnpm。执行 `corepack enable` 可启用 Node 提供的 pnpm。

```sh
node --version
corepack enable
pnpm --version
```

本教程不会创建、复制或提交 API Key、密码、Cookie、恢复码或浏览器会话。

## 1. 路径 A：使用 DeepSeek 官方 DSH runtime

DeepSeek 官方上游项目是 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，官方 CLI npm 包是 `@deepseek-ai/dsh`。本教程已经分别用 `@deepseek-ai/dsh@0.1.0-rc.6` 和 `@deepseek-ai/dsh@0.1.0-rc.7` 做过集成验证；下面固定使用 `0.1.0-rc.7`，避免运行时版本随时间变化。

如果尚未有 runtime，可创建单独目录并安装官方 CLI：

```sh
mkdir -p "$HOME/dsh-runtime"
cd "$HOME/dsh-runtime"
npm init -y
npm install @deepseek-ai/dsh@0.1.0-rc.7
```

从 runtime 目录安装插件到官方 Web profile：

```sh
node node_modules/@deepseek-ai/dsh/lib/bin.js plugin --profile web add --workspace-root \
  "https://github.com/18126295767-cell/dsh-mac-control/archive/<reviewed-commit-sha>.tar.gz"
```

请把 `<reviewed-commit-sha>` 替换成你在 GitHub 上已经审阅过的完整提交哈希。官方 DSH profile 本身是 pnpm workspace，所以必须保留 `--workspace-root`。本项目目前没有发布到 npm，因此 `plugin add dsh-mac-control` 不是有效的可复现安装命令。

检查 DSH 是否识别 bundle，而不启动服务：

```sh
node node_modules/@deepseek-ai/dsh/lib/bin.js --profile web --dump-config
```

输出中应包含：

```yaml
# == dsh-mac-control
- id: mac-control
  name: dsh-mac-control
```

启动官方 Web runtime：

```sh
node node_modules/@deepseek-ai/dsh/lib/bin.js web --port 3080
```

打开 `http://127.0.0.1:3080`。在 runtime 自己的设置界面或环境中配置模型提供方；不要把凭据写进本仓库。

在加入工作区、账号或凭据之前，干净的官方 Web 宿主应显示为：

![配置前的 DeepSeek 官方 DSH Web 宿主](docs/images/macos-dsh-home.png)

### 首次验证与权限

先要求 Harness 调用只读工具：

```text
mac_browser: action=list_tabs, browser=Safari
mac_desktop: action=frontmost_app
```

如果需要截图，调用 `mac_desktop` 的 `screenshot`。macOS 出现提示时，在「系统设置 → 隐私与安全性」授予**实际启动 DSH 的进程**自动化、辅助功能和屏幕录制权限。通常是 Terminal、iTerm、Node 或桌面外壳所启动的 Node 进程。

默认配置会为会改变浏览器或桌面的动作请求确认。输入密码、API Key、Cookie、恢复码或其他秘密前应始终由用户自己完成。

## 2. 路径 B：使用本地 DeepSeek Harness macOS App 外壳

App 源码是独立的社区项目 [deepseek-harness-macos-app](https://github.com/18126295767-cell/deepseek-harness-macos-app)。它是原生包装层：LaunchAgent 启动类似下列命令，然后在原生窗口中显示本机 `127.0.0.1:3080`：

```sh
node /absolute/path/to/dsh-runtime/node_modules/@deepseek-ai/dsh/lib/bin.js web --port 3080
```

因此，请先按照「路径 A」把插件加入 `web` profile，再从 App 的标准源码目录构建并安装外壳：

```sh
cd /absolute/path/to/deepseek-harness-macos-app
zsh ./scripts/build-app.sh --dsh-runtime /absolute/path/to/dsh-runtime --install
open "$HOME/Applications/DeepSeek Harness.app"
```

路径 B 会在原生 macOS 窗口中显示同一个本地 `web` profile：

![独立原生 macOS 外壳](docs/images/macos-app-home.png)

已安装 App 时，核对它实际使用的 runtime，不要猜测：

```sh
plutil -p "$HOME/Library/LaunchAgents/com.houxinran.deepseek-harness.plist"
```

`ProgramArguments` 中的第二项必须指向你希望使用的官方 `@deepseek-ai/dsh/lib/bin.js`。若你切换了 runtime 目录，重新运行同一个构建脚本并传入 `--dsh-runtime ... --install`，以重新生成 LaunchAgent。日志位于：

```text
~/Library/Logs/DeepSeekHarness.log
```

在 App 内执行与路径 A 相同的只读验证。App 不保存插件副本；它只显示由 LaunchAgent 启动的官方 Web profile。

### 这台 Mac 当前使用的目录

当前机器实际采用以下布局。这些路径用于核对本机配置，不是要求其他复现者照抄的公共默认值：

```text
官方 DSH runtime： $HOME/Documents/学习/dsh-runtime
App 外壳源码：     $HOME/Documents/学习/deepseek-harness-macos-app
已安装 App：       /Applications/DeepSeek Harness.app
LaunchAgent：      $HOME/Library/LaunchAgents/com.houxinran.deepseek-harness.plist
日志：             $HOME/Library/Logs/DeepSeekHarness.log
```

当前 LaunchAgent 实际启动：

```sh
/usr/local/bin/node \
  "$HOME/Documents/学习/dsh-runtime/node_modules/@deepseek-ai/dsh/lib/bin.js" \
  web --port 3080
```

已安装 App 的 bundle identifier 是 `com.houxinran.deepseek-harness`。由于当前副本位于 `/Applications`，建议用不依赖安装目录的命令启动：

```sh
open -a "DeepSeek Harness"
```

当前已安装 App 的外壳版本标记是 `0.1.0-rc.6`，配置的 runtime 当前也安装了 `@deepseek-ai/dsh@0.1.0-rc.6`。App 外壳版本与官方 CLI 包版本是两个独立值，不要根据 App 的“关于/信息”界面推断 runtime 版本；应直接检查：

```sh
cd "$HOME/Documents/学习/dsh-runtime"
node -p "require('./node_modules/@deepseek-ai/dsh/package.json').version"
```

如果移动或升级了 runtime，请从 App 源码目录重新构建和安装，然后先用 `plutil -p` 复核新生成的 LaunchAgent，再打开 App。

## 3. 可选：社区扩展 profile

[deepseek-harness-ultimate](https://github.com/18126295767-cell/deepseek-harness-ultimate) 是社区维护的、按提交固定的扩展插件清单；它在这台 Mac 上的源码路径是 `$HOME/Documents/学习/deepseek-harness-ultimate`。它适合在单独 profile 中试用，不应替代稳定的 `web` profile：

```sh
cd /absolute/path/to/deepseek-harness-ultimate
node scripts/audit-manifest.mjs
node scripts/install-ultimate.mjs --profile-dir "$HOME/.dsh/profiles/ultimate"
```

这一步**不会配置桌面 App**：App 的 LaunchAgent 明确启动官方 `web` profile；它也不会安装 DSH core。除非你有意重新设计并完整测试一套 Web profile，否则应把 `ultimate` 当作独立的审计/安装实验。它可能包含需要额外权限、凭据或兼容性评估的第三方组件。先审阅其 `COMPONENTS.md` 与 `profile/manifest.json`，不要把不受信任的插件安装进日常使用的 `web` profile。

## 4. 从源码复现本插件

```sh
git clone https://github.com/18126295767-cell/dsh-mac-control.git
cd dsh-mac-control
npm ci
npm test
npm pack --dry-run --json
```

要将当前源码链接到一个临时 profile：

```sh
node /absolute/path/to/dsh-runtime/node_modules/@deepseek-ai/dsh/lib/bin.js \
  plugin --profile mac-control-test add --workspace-root .
node /absolute/path/to/dsh-runtime/node_modules/@deepseek-ai/dsh/lib/bin.js \
  --profile mac-control-test --dump-config
```

删除测试 profile：

```sh
rm -rf "$HOME/.dsh/profiles/mac-control-test"
```

只删除明确命名的测试 profile，绝不要对 `~/.dsh` 执行递归删除。

## 5. 卸载与撤销权限

只从安装过本插件的 profile 中移除它：

```sh
node /absolute/path/to/dsh-runtime/node_modules/@deepseek-ai/dsh/lib/bin.js \
  plugin --profile web remove --workspace-root dsh-mac-control
```

随后运行 `--profile web --dump-config` 确认插件已经移除。已有截图仍保存在 `~/.dsh/mac-control/screenshots`，请先检查内容，再按文件删除。

若不再使用 App 外壳，先退出 App，再卸载这个明确命名的 LaunchAgent：

```sh
launchctl bootout "gui/$(id -u)/com.houxinran.deepseek-harness"
```

随后可把 `DeepSeek Harness.app` 与 `~/Library/LaunchAgents/com.houxinran.deepseek-harness.plist` 移到废纸篓。在「系统设置 → 隐私与安全性」中，手动撤销此前授予 App、Terminal 或 Node 的自动化、辅助功能和屏幕录制权限。不要为了卸载本插件或外壳而删除共享的 `~/.dsh` 目录。

## 6. Windows 配套环境

Windows 可以运行官方 DSH Web runtime，但本包的 `mac_browser` 和 `mac_desktop` 工具是
macOS 专用的：它们调用 `osascript`、Apple Automation、辅助功能和屏幕录制。不要把本包
安装到 Windows profile 后期待这些工具可用。

Windows 桌面启动器请使用配套项目
[deepseek-harness-macos-app/windows](https://github.com/18126295767-cell/deepseek-harness-macos-app/tree/main/windows)。
它启动官方 Web runtime，并生成便携 ZIP、NSIS 当前用户安装包和 SHA-256 校验清单。在
Windows 10/11 x64 上执行：

```powershell
Set-Location windows
& .\bootstrap-build-environment.ps1
& .\build-release.ps1 -Version 0.1.0
```

环境脚本通过 `winget` 安装 Git、Node.js LTS 和 NSIS，然后在 `$HOME\dsh-runtime` 创建
`@deepseek-ai/dsh@0.1.0-rc.7`。它不会安装凭据、profile 或本 macOS 专用插件。安装器改变
`PATH` 后请重新打开 PowerShell。

Windows 启动器日志位于 `%LOCALAPPDATA%\DeepSeek Harness\logs`；卸载时会保留独立管理的
DSH runtime/profile。未来的 Windows 原生浏览器/桌面控制插件必须单独审阅和安装，不能从
本 macOS 实现推断出来。

## 故障排除

| 现象 | 检查与处理 |
| --- | --- |
| `pnpm not found` | 执行 `corepack enable`，重新打开终端后重试。 |
| DSH 未显示 `mac-control` | 用 `--dump-config` 检查 profile；确认安装命令的 `--profile` 与启动时使用的一致。 |
| App 能打开但没有插件 | App 只加载其 LaunchAgent 的 `dsh web`，检查 plist runtime 路径和该 runtime 的 `~/.dsh/profiles/web/package.json`。 |
| macOS 拒绝自动化或截图 | 在隐私与安全性中授权实际启动 runtime 的终端/Node/App，然后重试。 |
| 第三方 profile 出错 | 使用干净 profile 重现；用 `--dump-config` 缩小到单个 bundle，不要在生产 profile 中盲目移除依赖。 |
