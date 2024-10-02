import * as PSX from './psx-engine-dist.js';
import { gameStart as cameraControllerGameStart, gameLoop as cameraControllerGameLoop } from '../scripts/cameraController.js';
import { gameStart as enemyGameStart, gameLoop as enemyGameLoop } from '../scripts/enemy.js';
import { gameStart as enemyShootGameStart, gameLoop as enemyShootGameLoop } from '../scripts/enemyShoot.js';
import { gameStart as floorGameStart, gameLoop as floorGameLoop } from '../scripts/floor.js';
import { gameStart as gameManagerGameStart, gameLoop as gameManagerGameLoop } from '../scripts/gameManager.js';
import { gameStart as inputsGameStart, gameLoop as inputsGameLoop } from '../scripts/inputs.js';
import { gameStart as playerGameStart, gameLoop as playerGameLoop } from '../scripts/player.js';
import { gameStart as playerShootGameStart, gameLoop as playerShootGameLoop } from '../scripts/playerShoot.js';

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
    cameraControllerGameStart(),
    enemyGameStart(),
    enemyShootGameStart(),
    floorGameStart(),
    gameManagerGameStart(),
    inputsGameStart(),
    playerGameStart(),
    playerShootGameStart()
  ]);

  console.log('Todos os componentes carregados!');

  // Após tudo carregar, você pode salvar o projeto, por exemplo:
  //setTimeout(saveProject, 10000);
}

// Função que será chamada a cada frame
function gameLoop() {
  // Este código é chamado em cada frame
  cameraControllerGameLoop();
  enemyGameLoop();
  enemyShootGameLoop();
  floorGameLoop();
  gameManagerGameLoop();
  inputsGameLoop();
  playerGameLoop();
  playerShootGameLoop();
}

// Função para salvar o projeto
function saveProject() {
  const sceneJson = PSX.saveProject();
  window.electron.saveProject(sceneJson); // Enviando o JSON para o processo principal
}

document.addEventListener('DOMContentLoaded', start);

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
