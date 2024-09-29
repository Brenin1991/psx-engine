const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, './dist/entities');
const gameJsPath = path.join(__dirname, './dist/game.js');

// Função que gera o conteúdo de importações e funções gameStart/gameLoop
function generateImportsAndCalls(files) {
  let imports = '';
  let gameStartCalls = '';
  let gameLoopCalls = '';

  files.forEach(file => {
    const moduleName = path.basename(file, '.js'); // Ex: armaInimigo
    const importName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1); // Ex: armaInimigoGameStart
    imports += `import { gameStart as ${importName}GameStart, gameLoop as ${importName}GameLoop } from './entities/${moduleName}.js';\n`;
    gameStartCalls += `  ${importName}GameStart();\n`;
    gameLoopCalls += `  ${importName}GameLoop();\n`;
  });

  return { imports, gameStartCalls, gameLoopCalls };
}

// Função principal que atualiza o game.js
function updateGameJs() {
  fs.readdir(entitiesDir, (err, files) => {
    if (err) {
      console.error("Erro ao ler o diretório entities:", err);
      return;
    }

    const jsFiles = files.filter(file => file.endsWith('.js'));

    const { imports, gameStartCalls, gameLoopCalls } = generateImportsAndCalls(jsFiles);

    // Conteúdo base do game.js com espaços reservados para as importações e chamadas de funções
    const newGameJsContent = `
import * as PSX from './psx-engine-dist.js';
${imports}
function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
${gameStartCalls}
}

// Função que será chamada a cada frame
function gameLoop() {
${gameLoopCalls}
}

document.addEventListener('DOMContentLoaded', start);
`;

    // Escreve o novo conteúdo no arquivo game.js
    fs.writeFile(gameJsPath, newGameJsContent, (err) => {
      if (err) {
        console.error("Erro ao escrever no game.js:", err);
      } else {
        console.log("game.js atualizado com sucesso!");
      }
    });
  });
}

// Chama a função de atualização
updateGameJs();
