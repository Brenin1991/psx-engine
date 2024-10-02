// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveProject: (jsonData) => ipcRenderer.send('save-project', jsonData),
  onSaveProjectReply: (callback) => ipcRenderer.on('save-project-reply', (event, response) => callback(response)),
  loadProject: () => ipcRenderer.send('load-project'), // Nova função para carregar projeto
  onLoadProjectReply: (callback) => ipcRenderer.on('load-project-reply', (event, response) => callback(response)), // Nova função para escutar resposta de carregamento
});
