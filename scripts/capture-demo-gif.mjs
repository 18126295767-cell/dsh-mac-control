#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { copyFile, mkdir, readFile, rm, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(process.argv[2] ?? join(root, 'docs/demo/dsh-mac-control-20s.gif'))
const frameDir = resolve('/private/tmp/dsh-mac-control-demo-frames')
const profileDir = resolve('/private/tmp/dsh-mac-control-demo-render-profile')
const encodeBinary = '/private/tmp/dsh-mac-control-encode-gif'
const chromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const stills = {
  tabs: resolve(root, 'docs/demo/dsh-mac-control-tabs-read.png'),
  button: resolve(root, 'docs/demo/dsh-mac-control-button-clicked.png'),
  screenshot: resolve(root, 'docs/demo/dsh-mac-control-screenshot.png'),
}
const demoPage = '/docs/demo/dsh-mac-control-demo.html'
const liveActions = process.env.DSH_DEMO_LIVE_ACTIONS === '1'
let browserURL
const demoState = {
  browser: 'Waiting for tab read',
  desktop: 'Waiting for app control',
  shot: 'Not captured',
  events: ['[ready] Waiting for the verified tool sequence...'],
}

const mime = { '.html': 'text/html; charset=utf-8' }
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname
  const file = resolve(root, `.${pathname}`)
  if (!file.startsWith(join(root, 'docs/demo')) || !file.endsWith('.html')) {
    response.writeHead(404); response.end('not found'); return
  }
  response.writeHead(200, { 'content-type': mime['.html'] })
  createReadStream(file).pipe(response)
})

function wait(ms) { return new Promise(resolvePromise => setTimeout(resolvePromise, ms)) }
function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...options })
    let stdout = ''; let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolvePromise(stdout.trim()) : reject(new Error(`${command} exited ${code}: ${stderr || stdout}`)))
  })
}

async function prepareRenderer() {
  await run('/usr/bin/swiftc', ['scripts/encode-gif.swift', '-o', encodeBinary], { cwd: root })
}

function stopProcessesForMarker(marker, signal = 'SIGTERM') {
  const listing = spawnSync('/bin/ps', ['-axo', 'pid=,command='], { encoding: 'utf8' }).stdout ?? ''
  for (const line of listing.split('\n')) {
    if (!line.includes(marker)) continue
    const pid = Number.parseInt(line.trim().split(/\s+/, 1)[0], 10)
    if (Number.isInteger(pid) && pid !== process.pid) {
      try { process.kill(pid, signal) } catch (_) {}
    }
  }
}

async function renderFrame(index) {
  const frame = join(frameDir, `${String(index).padStart(3, '0')}.png`)
  const frameProfile = `${profileDir}-${index}`
  const query = new URLSearchParams({ browser: demoState.browser, desktop: demoState.desktop, shot: demoState.shot })
  for (const event of demoState.events) query.append('event', event)
  await rm(frameProfile, { recursive: true, force: true })
  const child = spawn(chromeExecutable, [
    '--headless=new', '--hide-scrollbars', '--no-first-run', '--disable-background-networking',
    `--user-data-dir=${frameProfile}`, '--window-size=1600,1000', '--force-device-scale-factor=1.5',
    `--screenshot=${frame}`, `${browserURL}?${query}`,
  ], { stdio: 'ignore' })
  try {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        if ((await stat(frame)).size > 1_000) {
          await wait(150)
          return frame
        }
      } catch (_) {}
      await wait(100)
    }
    throw new Error(`Timed out rendering frame ${index}.`)
  } finally {
    if (!child.killed) child.kill('SIGTERM')
    await wait(200)
    stopProcessesForMarker(frameProfile, 'SIGKILL')
    await rm(frameProfile, { recursive: true, force: true })
  }
}

function setDemoStage(stage, value, event) {
  demoState[stage] = value
  demoState.events.push(event)
}

async function main() {
  try {
    await mkdir(frameDir, { recursive: true })
    await rm(profileDir, { recursive: true, force: true })
    await mkdir(profileDir, { recursive: true })
    await prepareRenderer()
    await new Promise((resolvePromise, reject) => server.listen(0, '127.0.0.1', error => error ? reject(error) : resolvePromise()))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Could not resolve the loopback demo port.')
    browserURL = `http://127.0.0.1:${address.port}${demoPage}`

    const { apply } = await import('../lib/index.js')
    const registered = []
    apply({ tools: { register: tool => registered.push(tool) }, on: () => {} }, { requireApproval: false, screenshotDirectory: frameDir })
    const browserTool = registered.find(tool => tool.name === 'mac_browser')
    const desktopTool = registered.find(tool => tool.name === 'mac_desktop')
    // The public demo must never inspect a user's existing browser session. Use
    // deterministic, sanitized fixture data while exercising the same tool
    // registration boundary that the host uses for real list_tabs calls.
    const isolatedTabFixtures = {
      'Google Chrome': [{ index: 1, title: 'Example documentation', url: 'https://example.invalid/docs' }],
      Safari: [{ index: 1, title: 'Local demo page', url: 'http://127.0.0.1/demo' }],
    }
    if (!browserTool || !desktopTool) throw new Error('The plugin did not register both demo tools.')
    const tabCount = Object.values(isolatedTabFixtures).reduce((total, tabs) => total + tabs.length, 0)
    setDemoStage('browser', 'Safari + Chrome tab lists read (isolated fixtures)', `[mac_browser] list_tabs -> ${tabCount} sanitized tabs`)

    for (let frame = 0; frame < 40; frame += 1) {
      if (frame === 8) {
        if (liveActions) {
          await desktopTool.execute({ action: 'activate', app: 'Calculator' }, { signal: undefined })
          await wait(500)
          // Coordinates are intentionally supplied by the caller in live mode;
          // the public recording defaults to the offline fixture path below.
          await desktopTool.execute({ action: 'click', app: 'Calculator', x: 100, y: 100 }, { signal: undefined })
          setDemoStage('desktop', 'Button clicked', '[mac_desktop] click -> Calculator button')
        } else {
          setDemoStage('desktop', 'Button clicked (offline fixture)', '[mac_desktop] click -> sanitized demo button')
        }
      }
      if (frame === 16) {
        if (liveActions) {
          await desktopTool.execute({ action: 'activate', app: 'TextEdit' }, { signal: undefined })
          setDemoStage('desktop', 'TextEdit activated', '[mac_desktop] activate -> TextEdit')
          await wait(500)
        } else {
          setDemoStage('desktop', 'TextEdit activated (offline fixture)', '[mac_desktop] activate -> sanitized app fixture')
        }
      }
      if (frame === 24) {
        if (liveActions) {
          const shot = await desktopTool.execute({ action: 'screenshot' }, { signal: undefined })
          setDemoStage('shot', 'PNG captured privately', '[mac_desktop] screenshot -> local PNG')
          await rm(shot.path, { force: true })
        } else {
          setDemoStage('shot', 'PNG captured privately (offline fixture)', '[mac_desktop] screenshot -> sanitized local fixture')
        }
      }
      const framePath = await renderFrame(frame)
      if (frame === 3) await copyFile(framePath, stills.tabs)
      if (frame === 10) await copyFile(framePath, stills.button)
      if (frame === 26) await copyFile(framePath, stills.screenshot)
    }

    await rm(output, { force: true })
    const result = spawnSync(encodeBinary, [output, '0.5', ...Array.from({ length: 40 }, (_, i) => join(frameDir, `${String(i).padStart(3, '0')}.png`))], { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) throw new Error(result.stderr || result.stdout)
    console.log(JSON.stringify({ output, frames: 40, durationSeconds: 20, stills, bytes: (await readFile(output)).length }, null, 2))
  } finally {
    server.close()
    await rm(frameDir, { recursive: true, force: true })
    await rm(profileDir, { recursive: true, force: true })
    await rm(encodeBinary, { force: true })
  }
}

main().catch(error => { server.close(); console.error(error.stack || error); process.exitCode = 1 })
