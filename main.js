const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const cryptoUtil = require(path.join(__dirname, 'src', 'crypto'))

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC handlers
ipcMain.handle('encrypt', async (event, plaintext, codes) => {
  return cryptoUtil.encrypt(plaintext, codes)
})

ipcMain.handle('decrypt', async (event, payload, codes) => {
  return cryptoUtil.decrypt(payload, codes)
})

ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData')
})

ipcMain.handle('save-local', async (event, filename, data) => {
  const userPath = app.getPath('userData')
  const full = path.join(userPath, filename)
  fs.writeFileSync(full, data, { encoding: 'utf8' })
  return { ok: true, path: full }
})

ipcMain.handle('load-local', async (event, filename) => {
  const userPath = app.getPath('userData')
  const full = path.join(userPath, filename)
  if (!fs.existsSync(full)) return null
  return fs.readFileSync(full, { encoding: 'utf8' })
})
