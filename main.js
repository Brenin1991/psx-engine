const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,     // Tela cheia
    frame: false,         // Remove a barra de título e bordas
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // Carregar o arquivo HTML do jogo que está na pasta 'game'
  win.loadFile('dist/index.html').then(() => {
    win.webContents.openDevTools(); // Abre o console do desenvolvedor
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
