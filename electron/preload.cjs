'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSettingsWindow: ()        => ipcRenderer.send('settings:open'),
  closeWindow:        ()        => ipcRenderer.send('window:close'),
  setTaskbarIcon:     (dataURL) => ipcRenderer.send('window:set-icon', dataURL),
});
