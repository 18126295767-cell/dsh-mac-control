import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { apply, name } from '../lib/index.js'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

async function pngDimensions(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url))
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

async function pngSha256(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url))
  return createHash('sha256').update(bytes).digest('hex')
}

async function gifSignature(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url))
  return bytes.subarray(0, 6).toString('ascii')
}

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

test('declares the reproducible v0.1.0 package and public install metadata', async () => {
  assert.equal(packageJson.version, '0.1.0')
  assert.equal(packageJson.publishConfig.access, 'public')
  assert.match(await readFile(new URL('../README.md', import.meta.url), 'utf8'), /npm install --save-exact dsh-mac-control@0\.1\.0/)
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

test('uses CoreGraphics for coordinate clicks on current macOS releases', async () => {
  const source = await readFile(new URL('../lib/index.js', import.meta.url), 'utf8')
  assert.match(source, /CGEventCreateMouseEvent/)
  assert.match(source, /CGEventPost/)
  assert.doesNotMatch(source, /systemEvents\.click\(\{ at:/)
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

test('ships lossless host screenshots used by every primary guide', async () => {
  assert.deepEqual(
    await pngDimensions('../docs/images/macos-dsh-home.png'),
    { width: 1600, height: 900 },
  )
  assert.deepEqual(
    await pngDimensions('../docs/images/macos-app-home.png'),
    { width: 1281, height: 768 },
  )

  for (const guide of ['README.md', 'TUTORIAL.md', 'TUTORIAL.zh-CN.md']) {
    const contents = await readFile(new URL(`../${guide}`, import.meta.url), 'utf8')
    assert.match(contents, /docs\/images\/macos-dsh-home\.png/, guide)
    assert.match(contents, /docs\/images\/macos-app-home\.png/, guide)
  }
  assert.ok(packageJson.files.includes('docs'))
})

test('ships reviewed Windows host screenshots with matching proof and guide links', async () => {
  const expected = new Map([
    ['windows-01-developer-preview.png', '654600d8acf83ae594d030182bdb542ea0c856074051771727c26460776679a7'],
    ['windows-02-api-key-onboarding.png', '9f18a256695951ccd5a2c53931a3f1beb56f54546f32bec97684426d8c14ff1d'],
    ['windows-03-empty-workspace.png', '7ae5f0587f09bfd75b6f586bdd2309b05f80a4a824ae664a9f1b051f67d46825'],
    ['windows-04-model-settings.png', 'c29b6e50e3ddaff41eedb44890ef051a03bc70a504c0249451cd5bf109e47980'],
    ['windows-05-plugin-inventory.png', 'e5fbc24b1715e3bd509b476cc99e907d7fcd8ac3aba589dd907867b4c8006351'],
  ])
  const proof = JSON.parse(await readFile(
    new URL('../docs/images/windows-screenshot-proof.json', import.meta.url),
    'utf8',
  ))

  assert.equal(proof.platform, 'win32')
  assert.equal(proof.architecture, 'x64')
  assert.equal(proof.runnerLabel, 'windows-2025')
  assert.equal(proof.runnerImage, 'win25-vs2026')
  assert.equal(proof.commit, 'a46c7279cf742c4fa82d3291016cc6fc66f445f1')
  assert.equal(proof.browserProfile, 'fresh non-persistent Playwright context')
  assert.equal(proof.screenshots.length, expected.size)

  for (const [file, hash] of expected) {
    assert.deepEqual(await pngDimensions(`../docs/images/${file}`), { width: 1600, height: 1000 }, file)
    assert.equal(await pngSha256(`../docs/images/${file}`), hash, file)
    const record = proof.screenshots.find(item => item.file === file)
    assert.equal(record?.sha256, hash, file)
    assert.equal(record?.width, 1600, file)
    assert.equal(record?.height, 1000, file)
  }

  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  assert.match(readme, /docs\/images\/windows-03-empty-workspace\.png/)
  assert.match(readme, /docs\/images\/windows-05-plugin-inventory\.png/)
  for (const guide of ['TUTORIAL.md', 'TUTORIAL.zh-CN.md']) {
    const contents = await readFile(new URL(`../${guide}`, import.meta.url), 'utf8')
    for (const file of expected.keys()) assert.match(contents, new RegExp(`docs/images/${file}`), guide)
  }
})

test('ships the local demo GIF and high-resolution stills', async () => {
  const gif = await readFile(new URL('../docs/demo/dsh-mac-control-20s.gif', import.meta.url))
  assert.ok(['GIF87a', 'GIF89a'].includes(await gifSignature('../docs/demo/dsh-mac-control-20s.gif')))
  assert.ok(gif.length >= 50_000, 'the demo GIF should contain rendered application states, not an error page')
  const stills = [
    '../docs/demo/dsh-mac-control-tabs-read.png',
    '../docs/demo/dsh-mac-control-button-clicked.png',
    '../docs/demo/dsh-mac-control-screenshot.png',
  ]
  for (const still of stills) {
    const bytes = await readFile(new URL(still, import.meta.url))
    const dimensions = await pngDimensions(still)
    assert.ok(dimensions.width >= 2000, `${still} should preserve native desktop width`)
    assert.ok(dimensions.height >= 1000, `${still} should preserve native desktop height`)
    assert.ok(bytes.length >= 50_000, `${still} should contain the rendered demo, not an error page`)
  }
  const record = await readFile(new URL('../docs/images/README.md', import.meta.url), 'utf8')
  assert.match(record, new RegExp(createHash('sha256').update(gif).digest('hex')))
  for (const name of ['dsh-mac-control-20s.gif', 'dsh-mac-control-tabs-read.png', 'dsh-mac-control-button-clicked.png', 'dsh-mac-control-screenshot.png']) {
    assert.match(record, new RegExp(name.replaceAll('.', '\\.') ), name)
  }
  for (const still of stills) assert.match(record, new RegExp(await pngSha256(still)))
  const packageFiles = packageJson.files.join('\n')
  assert.match(packageFiles, /docs/)
  assert.match(packageFiles, /scripts/)
})

test('ships community health and compatibility documentation', async () => {
  const required = [
    '../CONTRIBUTING.md', '../SECURITY.md', '../CODE_OF_CONDUCT.md', '../COMPATIBILITY.md',
    '../.github/ISSUE_TEMPLATE/bug_report.yml', '../.github/ISSUE_TEMPLATE/feature_request.yml',
    '../.github/ISSUE_TEMPLATE/config.yml', '../.github/pull_request_template.md',
  ]
  for (const file of required) assert.ok((await readFile(new URL(file, import.meta.url), 'utf8')).length > 40, file)
  const matrix = await readFile(new URL('../COMPATIBILITY.md', import.meta.url), 'utf8')
  assert.match(matrix, /macOS/)
  assert.match(matrix, /Node\.js/)
  assert.match(matrix, /0\.1\.0-rc\.7/)
  assert.match(matrix, /Google Chrome/)
  assert.match(matrix, /Safari/)
})

test('documents pnpm workspace-root handling for official DSH profiles', async () => {
  const workflow = await readFile(new URL('../.github/workflows/verify.yml', import.meta.url), 'utf8')
  assert.match(workflow, /plugin --profile web add --workspace-root \"\$GITHUB_WORKSPACE\"/)

  for (const guide of ['README.md', 'TUTORIAL.md', 'TUTORIAL.zh-CN.md']) {
    const contents = await readFile(new URL(`../${guide}`, import.meta.url), 'utf8')
    assert.match(
      contents,
      /plugin --profile web add --workspace-root \\/,
      `${guide} must preserve the flag required by the official DSH profile workspace`,
    )
  }
})
