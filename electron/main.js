const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')

let widgetWindow = null
let inputWindow = null

function createWidget() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  widgetWindow = new BrowserWindow({
    width: 56,
    height: 56,
    x: width - 80,
    y: height - 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })

  widgetWindow.loadFile(path.join(__dirname, 'widget.html'))
  widgetWindow.setAlwaysOnTop(true, 'screen-saver')
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
}

function openInput() {
  if (inputWindow) {
    inputWindow.focus()
    return
  }

  const wb = widgetWindow.getBounds()
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const w = 320, h = 160
  let x = wb.x - w - 12
  let y = wb.y + wb.height / 2 - h / 2
  if (x < 8) x = wb.x + wb.width + 12
  if (y < 8) y = 8
  if (y + h > sh - 8) y = sh - h - 8

  inputWindow = new BrowserWindow({
    width: w,
    height: h,
    x,
    y,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })

  inputWindow.loadFile(path.join(__dirname, 'input.html'))
  inputWindow.setAlwaysOnTop(true, 'screen-saver')
  inputWindow.setVisibleOnAllWorkspaces(true)

  inputWindow.on('closed', () => { inputWindow = null })
  inputWindow.on('blur', () => {
    // Small delay so clicks on widget don't immediately close
    setTimeout(() => { if (inputWindow && !inputWindow.isFocused()) inputWindow?.close() }, 200)
  })
}

ipcMain.on('toggle-input', () => {
  if (inputWindow) { inputWindow.close(); inputWindow = null }
  else openInput()
})

ipcMain.on('close-input', () => {
  inputWindow?.close()
  inputWindow = null
})

ipcMain.on('move-widget', (_, { x, y }) => {
  widgetWindow?.setPosition(Math.round(x), Math.round(y))
})

app.whenReady().then(createWidget)
app.on('window-all-closed', (e) => e.preventDefault())
