'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSettingsWindow: () => ipcRenderer.send('settings:open'),
  closeWindow:        () => ipcRenderer.send('window:close'),
  startDrag:          () => ipcRenderer.send('window:drag-start'),
  stopDrag:           () => ipcRenderer.send('window:drag-stop'),
});
