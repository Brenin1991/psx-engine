const fs = require('fs');
const path = require('path');

// Caminhos
const entitiesDir = path.join(__dirname, './project/scripts');
const gameJsPath = path.join(__dirname, './project/engine/core.js');

// Código base para novos arquivos JS
const baseJsContent = `
import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';

export function gameStart() {
  // Inicialização do script
  initializeWithRetry(() => {
      // Evita repetição durante a inicialização
  });
}

export function gameLoop() {
  // Lógica do loop do script
}
`;

// Função para gerar novo arquivo JS na pasta entities
function createNewEntityFile(fileName) {
  const filePath = path.join(entitiesDir, `${fileName}.js`);
  
  // Verifica se o arquivo já existe
  if (fs.existsSync(filePath)) {
    console.log(`O arquivo ${fileName}.js já existe.`);
    return;
  }
  
  // Cria o arquivo com o código base
  fs.writeFile(filePath, baseJsContent.trim(), (err) => {
    if (err) {
      console.error(`Erro ao criar o arquivo ${fileName}.js:`, err);
    } else {
      console.log(`Arquivo ${fileName}.js criado com sucesso!`);
      // Atualiza o game.js após criar o novo arquivo
      updateGameJs();
    }
  });
}

// Função que gera o conteúdo de importações e funções gameStart/gameLoop
function generateImportsAndCalls(files) {
  let imports = '';
  let gameStartCalls = '';
  let gameLoopCalls = '';

  files.forEach(file => {
    const moduleName = path.basename(file, '.js'); // Ex: armaInimigo
    const importName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1); // Ex: armaInimigoGameStart
    imports += `import { gameStart as ${importName}GameStart, gameLoop as ${importName}GameLoop } from '../scripts/${moduleName}.js';\n`;
    gameStartCalls += `  ${importName}GameStart(),\n`;
    gameLoopCalls += `  ${importName}GameLoop();\n`;
  });

  return { imports, gameStartCalls, gameLoopCalls };
}

// Função que atualiza o game.js
function updateGameJs() {
  fs.readdir(entitiesDir, (err, files) => {
    if (err) {
      console.error("Erro ao ler o diretório entities:", err);
      return;
    }

    const jsFiles = files.filter(file => file.endsWith('.js'));
    const { imports, gameStartCalls, gameLoopCalls } = generateImportsAndCalls(jsFiles);

    // Conteúdo base do game.js
    const newGameJsContent = `
import * as PSX from './psx-engine-dist.js';
${imports}

let sceneLoad;

async function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine

  // Um delay aqui, por exemplo 5 segundos (5000 milissegundos)
  await delay(5000);
  // Carregar o projeto e esperar que o carregamento finalize antes de continuar
  await loadProject();

  console.log('Projeto carregado com sucesso, iniciando gameStart.');

  // Inicia o gameStart após o projeto ser carregado
  await gameStart();

  // Agora o jogo continua normalmente
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função que será chamada no primeiro frame
async function gameStart() {
// Espera todas as funções gameStart terminarem antes de iniciar o loop do jogo
  await Promise.all([
    ${gameStartCalls}
  ]);
  console.log('Todos os componentes carregados!');
}

// Função que será chamada a cada frame
async function gameLoop() {
${gameLoopCalls}
}


document.addEventListener('DOMContentLoaded', start);

// Função para salvar o projeto
function saveProject() {
  const sceneJson = PSX.saveProject();
  window.electron.saveProject(sceneJson); // Enviando o JSON para o processo principal
}

// Receber resposta do processo principal
window.electron.onSaveProjectReply((response) => {
  console.log(response.message); // Log da resposta
});

async function loadProject() {
  return new Promise((resolve, reject) => {
    window.electron.loadProject();

    // Escutar a resposta do processo principal
    window.electron.onLoadProjectReply((response) => {
      console.log(response.message);
      if (response.data) {
        // Aqui você pode usar os dados do projeto como desejar
        console.log('Dados do projeto:', response.data);
        sceneLoad = response.data;
        PSX.loadProject(sceneLoad);
        resolve(); // Resolve a promessa quando o projeto for carregado
      } else {
        reject(new Error('Falha ao carregar o projeto.'));
      }
    });
  });
}
`;

    // Escreve o novo conteúdo no game.js
    fs.writeFile(gameJsPath, newGameJsContent.trim(), (err) => {
      if (err) {
        console.error("Erro ao escrever no game.js:", err);
      } else {
        console.log("game.js atualizado com sucesso!");
      }
    });
  });
}

// Função principal para criar um novo arquivo e atualizar o game.js
function createAndAddEntity(entityName) {
  createNewEntityFile(entityName);
}

// Executa a criação de um novo arquivo a partir do nome passado pelo terminal
const entityName = process.argv[2]; // Recebe o nome do arquivo como argumento

if (entityName) {
  createAndAddEntity(entityName);
} else {
  console.log('Por favor, forneça um nome para o novo arquivo JS.');
}
