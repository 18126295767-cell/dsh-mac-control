import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { apply, name } from '../lib/index.js'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

function loadPlugin(config = {}) {
  const registered = []
  const events = []
  apply({
    tools: { register: tool => registered.push(tool) },
    on: (event, handler) => events.push({ event, handler }),
  }, config)
  return { registered, events }
}

test('registers the browser and desktop tools', () => {
  const { registered } = loadPlugin()
  assert.equal(name, 'dsh-mac-control')
  assert.deepEqual(registered.map(tool => tool.name), ['mac_browser', 'mac_desktop'])
  assert.equal(typeof registered[0].execute, 'function')
  assert.equal(typeof registered[1].execute, 'function')
})

test('rejects unsupported browser URLs before invoking macOS', async () => {
  const { registered } = loadPlugin()
  const browser = registered.find(tool => tool.name === 'mac_browser')
  await assert.rejects(
    browser.execute({ action: 'open', browser: 'Safari', url: 'file:///tmp/example.html' }, {}),
    /browser URLs must use http or https/,
  )
})

test('rejects invalid desktop coordinates before invoking macOS', async () => {
  const { registered } = loadPlugin()
  const desktop = registered.find(tool => tool.name === 'mac_desktop')
  await assert.rejects(
    desktop.execute({ action: 'click', app: 'Finder', x: -1, y: 10 }, {}),
    /x must be an integer from 0 to 20000/,
  )
})

test('enables approval hooks by default and allows an explicit opt-out', () => {
  assert.equal(loadPlugin().events.length, 1)
  assert.equal(loadPlugin({ requireApproval: false }).events.length, 0)
})

test('asks for approval before browser and desktop mutations', async () => {
  const { events } = loadPlugin()
  const approval = events[0].handler
  const allow = async () => ({ kind: 'allow' })

  assert.deepEqual(
    await approval({ name: 'mac_browser', arguments: { action: 'open' } }, allow),
    { kind: 'ask', reason: 'This will operate a local browser or macOS application.' },
  )
  assert.deepEqual(
    await approval({ name: 'mac_desktop', arguments: { action: 'type_text' } }, allow),
    { kind: 'ask', reason: 'This will operate a local browser or macOS application.' },
  )
})

test('allows read-only browser and desktop actions without an approval prompt', async () => {
  const { events } = loadPlugin()
  const approval = events[0].handler
  const allow = async () => ({ kind: 'allow' })

  assert.deepEqual(
    await approval({ name: 'mac_browser', arguments: { action: 'list_tabs' } }, allow),
    { kind: 'allow' },
  )
  assert.deepEqual(
    await approval({ name: 'mac_desktop', arguments: { action: 'frontmost_app' } }, allow),
    { kind: 'allow' },
  )
})

test('uses host-provided DSH core packages instead of bundling a second runtime', () => {
  const bundledCorePackages = Object.keys(packageJson.dependencies ?? {})
    .filter(packageName => packageName.startsWith('@deepseek-ai/dsh-'))

  assert.deepEqual(bundledCorePackages, [])
  assert.equal(packageJson.peerDependencies['@deepseek-ai/dsh-tools'], '>=0.1.0-rc.6 <0.2.0')
})
