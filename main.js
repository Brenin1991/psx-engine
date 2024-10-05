const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

// Função para criar a janela
function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Caminho correto para o preload.js
    }
  });

  win.loadFile('project/editor.html').then(() => {
    win.webContents.openDevTools();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manipulador para salvar o projeto
ipcMain.on('save-project', (event, sceneJson) => {
  fs.writeFile(path.join(__dirname, 'save.json'), JSON.stringify(sceneJson), (err) => {
    if (err) {
      console.error('Erro ao salvar o projeto:', err);
      event.reply('save-project-reply', { message: 'Erro ao salvar o projeto' });
    } else {
      event.reply('save-project-reply', { message: 'Projeto salvo com sucesso!' });
    }
  });
});

// Manipulador para ler o projeto
ipcMain.on('load-project', (event) => {
  fs.readFile(path.join(__dirname, 'save.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o projeto:', err);
      event.reply('load-project-reply', { message: 'Erro ao ler o projeto' });
    } else {
      const sceneJson = JSON.parse(data); // Converte de string para objeto
      event.reply('load-project-reply', { message: 'Projeto carregado com sucesso!', data: sceneJson });
    }
  });
});
