import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-mac-control'
export const inject = ['tools']

const MAX_TEXT_LENGTH = 5_000
const MAX_UI_ITEMS = 300
const MAX_COORDINATE = 20_000

function resolveConfig(rawConfig) {
  const input = rawConfig !== null && typeof rawConfig === 'object' ? rawConfig : {}
  const browsers = Array.isArray(input.browsers) && input.browsers.length > 0 && input.browsers.every(value => typeof value === 'string' && value.trim() !== '')
    ? input.browsers
    : ['Safari', 'Google Chrome']
  const screenshotDirectory = typeof input.screenshotDirectory === 'string' && input.screenshotDirectory.trim() !== ''
    ? input.screenshotDirectory
    : '~/.dsh/mac-control/screenshots'
  const requireApproval = input.requireApproval === true
  const maxUiItems = Number.isInteger(input.maxUiItems)
    ? Math.min(Math.max(input.maxUiItems, 10), MAX_UI_ITEMS)
    : 120
  return { browsers, screenshotDirectory, requireApproval, maxUiItems }
}

/** Run a local command without a shell and return its UTF-8 output. */
function runCommand(command, args, { env, signal } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      env: env === undefined ? process.env : { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    const abort = () => child.kill('SIGTERM')
    if (signal !== undefined) {
      if (signal.aborted) abort()
      else signal.addEventListener('abort', abort, { once: true })
    }
    child.on('error', error => reject(error))
    child.on('close', code => {
      signal?.removeEventListener('abort', abort)
      if (signal?.aborted) {
        reject(new Error('mac-control: operation cancelled'))
        return
      }
      if (code !== 0) {
        reject(new Error(`mac-control: ${command} exited with ${code}: ${(stderr || stdout).trim()}`))
        return
      }
      resolvePromise(stdout.trim())
    })
  })
}

/** Execute a data-only JXA request. Request fields are never interpolated into source code. */
async function runJxa(request, signal) {
  const output = await runCommand('/usr/bin/osascript', ['-l', 'JavaScript', '-e', JXA_PROGRAM], {
    env: { DSH_MAC_CONTROL_REQUEST: JSON.stringify(request) },
    signal,
  })
  try {
    return JSON.parse(readJsonPrefix(output))
  } catch {
    throw new Error(`mac-control: invalid JXA response: ${output}`)
  }
}

function readJsonPrefix(text) {
  const start = text.search(/[\[{]/)
  if (start < 0) throw new Error('no JSON value')
  const opening = text[start]
  const closing = opening === '{' ? '}' : ']'
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < text.length; index += 1) {
    const character = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character === opening) depth += 1
    else if (character === closing) {
      depth -= 1
      if (depth === 0) return text.slice(start, index + 1)
    }
  }
  throw new Error('incomplete JSON value')
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`mac-control: ${label} must be a non-empty string`)
  if (value.length > MAX_TEXT_LENGTH) throw new Error(`mac-control: ${label} exceeds ${MAX_TEXT_LENGTH} characters`)
  return value
}

function assertIndex(value, label) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`mac-control: ${label} must be a positive integer`)
  return value
}

function assertCoordinate(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > MAX_COORDINATE) {
    throw new Error(`mac-control: ${label} must be an integer from 0 to ${MAX_COORDINATE}`)
  }
  return value
}

function normalizeDirectory(directory) {
  const expanded = directory === '~' ? homedir() : directory.startsWith('~/') ? join(homedir(), directory.slice(2)) : directory
  return isAbsolute(expanded) ? resolve(expanded) : resolve(homedir(), expanded)
}

function assertBrowser(browser, browsers) {
  const selected = assertString(browser, 'browser')
  if (!browsers.includes(selected)) {
    throw new Error(`mac-control: browser must be one of ${browsers.join(', ')}`)
  }
  return selected
}

function assertWebUrl(value) {
  const text = assertString(value, 'url')
  let url
  try {
    url = new URL(text)
  } catch {
    throw new Error('mac-control: url must be a valid absolute URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('mac-control: browser URLs must use http or https')
  }
  return url.href
}

function browserArgs(args, config) {
  const action = assertString(args.action, 'action')
  const browser = assertBrowser(args.browser, config.browsers)
  switch (action) {
    case 'list_tabs':
      return { action, browser }
    case 'open':
      return { action, browser, url: assertWebUrl(args.url) }
    case 'navigate':
      return {
        action,
        browser,
        windowIndex: assertIndex(args.windowIndex ?? 1, 'windowIndex'),
        tabIndex: assertIndex(args.tabIndex ?? 1, 'tabIndex'),
        url: assertWebUrl(args.url),
      }
    case 'activate_tab':
      return {
        action,
        browser,
        windowIndex: assertIndex(args.windowIndex ?? 1, 'windowIndex'),
        tabIndex: assertIndex(args.tabIndex ?? 1, 'tabIndex'),
      }
    default:
      throw new Error(`mac-control: unsupported browser action ${action}`)
  }
}

async function executeBrowser(args, config, signal) {
  const request = browserArgs(args, config)
  if (request.action === 'open') {
    await runCommand('/usr/bin/open', ['-a', request.browser, request.url], { signal })
    return { action: request.action, browser: request.browser, url: request.url, opened: true }
  }
  return runJxa(request, signal)
}

function desktopArgs(args, config) {
  const action = assertString(args.action, 'action')
  if (action === 'list_apps' || action === 'frontmost_app' || action === 'screenshot') return { action }
  const app = assertString(args.app, 'app')
  switch (action) {
    case 'launch':
    case 'activate':
      return { action, app }
    case 'window_list':
      return { action, app }
    case 'ui_tree':
      return { action, app, maxItems: Math.min(args.maxItems ?? config.maxUiItems, config.maxUiItems) }
    case 'click':
      return { action, app, x: assertCoordinate(args.x, 'x'), y: assertCoordinate(args.y, 'y') }
    case 'type_text':
      return { action, app, text: assertString(args.text, 'text') }
    case 'key_press': {
      const key = assertString(args.key, 'key')
      const modifiers = args.modifiers ?? []
      if (!Array.isArray(modifiers) || modifiers.some(value => !['command', 'control', 'option', 'shift'].includes(value))) {
        throw new Error('mac-control: modifiers must contain only command, control, option, or shift')
      }
      return { action, app, key, modifiers }
    }
    default:
      throw new Error(`mac-control: unsupported desktop action ${action}`)
  }
}

async function executeDesktop(args, config, signal) {
  const request = desktopArgs(args, config)
  if (request.action === 'screenshot') {
    const directory = normalizeDirectory(config.screenshotDirectory)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    const path = join(directory, `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.png`)
    await runCommand('/usr/sbin/screencapture', ['-x', '-t', 'png', path], { signal })
    return { action: 'screenshot', path }
  }
  return runJxa(request, signal)
}

function isMutation(exec) {
  if (exec.name === 'mac_browser') {
    const action = exec.arguments?.action
    return action !== 'list_tabs'
  }
  if (exec.name !== 'mac_desktop') return false
  const action = exec.arguments?.action
  return !['list_apps', 'frontmost_app', 'window_list', 'ui_tree', 'screenshot'].includes(action)
}

export function apply(ctx, rawConfig) {
  const config = resolveConfig(rawConfig)
  ctx.tools.register(defineTool({
    name: 'mac_browser',
    description: 'Control the local Safari or Google Chrome browser. List tabs before choosing a tab index. Use open for a new URL, navigate to change an existing tab, or activate_tab to focus a tab. Browser URLs are limited to http and https. Never provide passwords, cookies, or other secrets in tool arguments.',
    parameters: {
      action: { type: 'string', required: true, enum: ['list_tabs', 'open', 'navigate', 'activate_tab'], description: 'Browser action.' },
      browser: { type: 'string', required: true, description: 'Configured browser name: Safari or Google Chrome.' },
      url: { type: 'string', description: 'Required for open and navigate. An absolute http(s) URL.' },
      windowIndex: { type: 'integer', description: 'One-based window index for navigate or activate_tab. Defaults to 1.' },
      tabIndex: { type: 'integer', description: 'One-based tab index for navigate or activate_tab. Defaults to 1.' },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    execute: (args, exec) => executeBrowser(args, config, exec.signal),
    timeoutMs: 30_000,
  }))
  ctx.tools.register(defineTool({
    name: 'mac_desktop',
    description: 'Control local macOS applications via the normal Apple Automation and Accessibility permissions. Actions: list_apps, frontmost_app, launch, activate, window_list, ui_tree, click, type_text, key_press, screenshot. Inspect ui_tree before using coordinate clicks when possible. Never type passwords, API keys, recovery codes, or other secrets.',
    parameters: {
      action: { type: 'string', required: true, enum: ['list_apps', 'frontmost_app', 'launch', 'activate', 'window_list', 'ui_tree', 'click', 'type_text', 'key_press', 'screenshot'], description: 'Desktop action.' },
      app: { type: 'string', description: 'Application name for every action except list_apps, frontmost_app, and screenshot.' },
      x: { type: 'integer', description: 'Screen x coordinate for click.' },
      y: { type: 'integer', description: 'Screen y coordinate for click.' },
      text: { type: 'string', description: 'Text for type_text.' },
      key: { type: 'string', description: 'Key for key_press, such as Return, Tab, Escape, Left, or a character.' },
      modifiers: { type: 'array', items: { type: 'string' }, description: 'Optional key modifiers: command, control, option, shift.' },
      maxItems: { type: 'integer', description: 'Maximum accessible controls returned by ui_tree.' },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    execute: (args, exec) => executeDesktop(args, config, exec.signal),
    timeoutMs: 30_000,
  }))
  if (config.requireApproval) {
    ctx.on('tools/pre-execute', async (exec, next) => {
      const downstream = await next()
      if (downstream.kind !== 'allow' || !isMutation(exec)) return downstream
      return { kind: 'ask', reason: 'This will operate a local browser or macOS application.' }
    })
  }
}

const JXA_PROGRAM = String.raw`
ObjC.import('AppKit')
const raw = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('DSH_MAC_CONTROL_REQUEST'))
const request = JSON.parse(raw)
const systemEvents = Application('System Events')
systemEvents.includeStandardAdditions = true

function safe(read) {
  try { return read() } catch (_) { return null }
}
function appByName(name) { return Application(name) }
function modifierKeys(modifiers) { return modifiers.map(value => value + ' down') }
function specialKeyCode(key) {
  return ({ Return: 36, Enter: 36, Tab: 48, Escape: 53, Space: 49, Delete: 51, Backspace: 51, Left: 123, Right: 124, Down: 125, Up: 126, Home: 115, End: 119, PageUp: 116, PageDown: 121 })[key]
}
function appProcess(name) {
  const process = systemEvents.processes.byName(name)
  if (!safe(() => process.exists())) throw new Error('Application is not running: ' + name)
  return process
}
function collection(items, limit, mapper) {
  const result = []
  for (const item of items.slice(0, limit)) result.push(mapper(item))
  return result
}
function control(item) {
  return {
    name: safe(() => item.name()),
    description: safe(() => item.description()),
    value: safe(() => item.value()),
    position: safe(() => item.position()),
    size: safe(() => item.size()),
  }
}
function run() {
  if (request.action === 'list_apps') {
    const workspace = $.NSWorkspace.sharedWorkspace
    const apps = workspace.runningApplications.js
      .filter(app => !app.terminated)
      .map(app => ({ name: ObjC.unwrap(app.localizedName), bundleId: ObjC.unwrap(app.bundleIdentifier), active: app.active }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return { action: 'list_apps', apps }
  }
  if (request.action === 'frontmost_app') {
    const process = systemEvents.processes.whose({ frontmost: true })[0]
    return { action: 'frontmost_app', app: process ? safe(() => process.name()) : null }
  }
  if (request.action === 'list_tabs') {
    const browser = appByName(request.browser)
    if (!browser.running()) return { action: 'list_tabs', browser: request.browser, running: false, windows: [] }
    if (request.browser === 'Safari') {
      return { action: 'list_tabs', browser: request.browser, running: true, windows: [{ index: 1, tabs: collection(browser.documents(), 200, (document, index) => ({ index: index + 1, title: safe(() => document.name()), url: safe(() => document.url()) })) }] }
    }
    return { action: 'list_tabs', browser: request.browser, running: true, windows: collection(browser.windows(), 50, (window, windowIndex) => ({ index: windowIndex + 1, activeTabIndex: safe(() => window.activeTabIndex()), tabs: collection(window.tabs(), 200, (tab, tabIndex) => ({ index: tabIndex + 1, title: safe(() => tab.title()), url: safe(() => tab.url()) })) })) }
  }
  if (request.action === 'navigate') {
    const browser = appByName(request.browser)
    browser.activate()
    if (request.browser === 'Safari') {
      const document = browser.documents()[request.tabIndex - 1]
      if (document === undefined) throw new Error('Safari tab index does not exist')
      document.url = request.url
    } else {
      const window = browser.windows()[request.windowIndex - 1]
      if (window === undefined) throw new Error('Chrome window index does not exist')
      const tab = window.tabs()[request.tabIndex - 1]
      if (tab === undefined) throw new Error('Chrome tab index does not exist')
      window.activeTabIndex = request.tabIndex
      tab.url = request.url
    }
    return { action: 'navigate', browser: request.browser, url: request.url, windowIndex: request.windowIndex, tabIndex: request.tabIndex }
  }
  if (request.action === 'activate_tab') {
    const browser = appByName(request.browser)
    browser.activate()
    if (request.browser === 'Safari') {
      const document = browser.documents()[request.tabIndex - 1]
      if (document === undefined) throw new Error('Safari tab index does not exist')
      document.activate()
    } else {
      const window = browser.windows()[request.windowIndex - 1]
      if (window === undefined) throw new Error('Chrome window index does not exist')
      if (window.tabs()[request.tabIndex - 1] === undefined) throw new Error('Chrome tab index does not exist')
      window.activeTabIndex = request.tabIndex
      window.index = 1
    }
    return { action: 'activate_tab', browser: request.browser, windowIndex: request.windowIndex, tabIndex: request.tabIndex }
  }
  if (request.action === 'launch' || request.action === 'activate') {
    const application = appByName(request.app)
    application.activate()
    return { action: request.action, app: request.app, activated: true }
  }
  if (request.action === 'window_list') {
    const process = appProcess(request.app)
    return { action: 'window_list', app: request.app, windows: collection(process.windows(), 100, (window, index) => ({ index: index + 1, name: safe(() => window.name()), position: safe(() => window.position()), size: safe(() => window.size()) })) }
  }
  if (request.action === 'ui_tree') {
    const process = appProcess(request.app)
    const limit = request.maxItems
    return {
      action: 'ui_tree', app: request.app,
      windows: collection(process.windows(), limit, (window, index) => ({ index: index + 1, name: safe(() => window.name()), position: safe(() => window.position()), size: safe(() => window.size()) })),
      buttons: collection(process.buttons(), limit, control),
      textFields: collection(process.textFields(), limit, control),
      textAreas: collection(process.textAreas(), limit, control),
      staticTexts: collection(process.staticTexts(), limit, control),
    }
  }
  if (request.action === 'click') {
    appByName(request.app).activate()
    systemEvents.click({ at: [request.x, request.y] })
    return { action: 'click', app: request.app, x: request.x, y: request.y, clicked: true }
  }
  if (request.action === 'type_text') {
    appByName(request.app).activate()
    systemEvents.keystroke(request.text)
    return { action: 'type_text', app: request.app, characters: request.text.length, typed: true }
  }
  if (request.action === 'key_press') {
    appByName(request.app).activate()
    const using = modifierKeys(request.modifiers)
    const keyCode = specialKeyCode(request.key)
    if (keyCode === undefined) systemEvents.keystroke(request.key, { using })
    else systemEvents.keyCode(keyCode, { using })
    return { action: 'key_press', app: request.app, key: request.key, modifiers: request.modifiers, pressed: true }
  }
  throw new Error('Unsupported action: ' + request.action)
}
const result = run()
const data = $(JSON.stringify(result) + '\\n').dataUsingEncoding($.NSUTF8StringEncoding)
$.NSFileHandle.fileHandleWithStandardOutput.writeData(data)
undefined
`

export const pluginPath = fileURLToPath(import.meta.url)
