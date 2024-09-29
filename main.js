const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,     // Tela cheia
    frame: false,         // Remove a barra de título e bordas
    webPreferences: {
      nodeIntegration: true, // ou use contextIsolation: false, se apropriado
      preload: path.join(__dirname, 'preload.js'), // Opcional, se usar preload
      nodeIntegration: true
    }
  });

  // Carregar o arquivo HTML do jogo que está na pasta 'game'
  win.loadFile('game/index.html').then(() => {
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
