const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('jarvis', {
  toggleInput: () => ipcRenderer.send('toggle-input'),
  closeInput: () => ipcRenderer.send('close-input'),
  moveWidget: (x, y) => ipcRenderer.send('move-widget', { x, y }),
})
