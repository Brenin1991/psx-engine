import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'scene.json');

export function saveJson(data) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Erro ao salvar o arquivo JSON:', err);
    } else {
      console.log('JSON salvo com sucesso!');
    }
  });
}

export function loadJson() {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao carregar o arquivo JSON:', err);
    } else {
      console.log('Conteúdo do JSON:', JSON.parse(data));
    }
  });
}
