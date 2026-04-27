const { app, BrowserWindow, ipcMain, screen, session, systemPreferences } = require('electron')
const path = require('path')
const fs   = require('fs')

let widgetWindow = null
let setupWindow  = null

// Simple config file in userData
function cfgPath() { return path.join(app.getPath('userData'), 'jarvis-config.json') }
function loadCfg() {
  try { return JSON.parse(fs.readFileSync(cfgPath(), 'utf8')) } catch { return null }
}
function saveCfg(cfg) { fs.writeFileSync(cfgPath(), JSON.stringify(cfg)) }

function createWidget() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  widgetWindow = new BrowserWindow({
    width: 64,
    height: 64,
    x: width - 88,
    y: height - 108,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    show: false,
    // panel = macOS NSPanel: stays on top without stealing focus
    type: process.platform === 'darwin' ? 'panel' : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })

  widgetWindow.loadFile(path.join(__dirname, 'widget.html'))
  widgetWindow.setAlwaysOnTop(true, 'screen-saver')
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  widgetWindow.once('ready-to-show', () => widgetWindow.show())
}

function openSetup() {
  if (setupWindow) { setupWindow.focus(); return }

  const wb = widgetWindow.getBounds()
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const w = 320, h = 148
  let x = wb.x - w - 12
  let y = wb.y + wb.height / 2 - h / 2
  if (x < 8) x = wb.x + wb.width + 12
  if (y < 8) y = 8
  if (y + h > sh - 8) y = sh - h - 8

  setupWindow = new BrowserWindow({
    width: w, height: h, x, y,
    frame: false, transparent: false,
    alwaysOnTop: true, skipTaskbar: true, resizable: false,
    type: process.platform === 'darwin' ? 'panel' : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })
  setupWindow.loadFile(path.join(__dirname, 'setup.html'))
  setupWindow.setAlwaysOnTop(true, 'screen-saver')
  setupWindow.on('closed', () => { setupWindow = null })
}

ipcMain.on('open-setup',   openSetup)
ipcMain.on('setup-done',   () => { setupWindow?.close(); setupWindow = null })
ipcMain.on('save-config',  (_, cfg) => saveCfg(cfg))
ipcMain.handle('get-config', () => loadCfg())

ipcMain.on('move-widget', (_, { x, y }) => {
  widgetWindow?.setPosition(Math.round(x), Math.round(y))
})

app.whenReady().then(async () => {
  // Allow mic access in renderer
  session.defaultSession.setPermissionRequestHandler((_, permission, cb) => {
    cb(permission === 'media')
  })
  // macOS: request mic permission upfront
  if (process.platform === 'darwin') {
    await systemPreferences.askForMediaAccess('microphone').catch(() => {})
  }
  createWidget()
})

app.on('window-all-closed', (e) => e.preventDefault())
