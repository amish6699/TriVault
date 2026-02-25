const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  encrypt: (plaintext, codes) => ipcRenderer.invoke('encrypt', plaintext, codes),
  decrypt: (payload, codes) => ipcRenderer.invoke('decrypt', payload, codes),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  saveLocal: (filename, data) => ipcRenderer.invoke('save-local', filename, data),
  loadLocal: (filename) => ipcRenderer.invoke('load-local', filename)
})
