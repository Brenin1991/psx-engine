import * as PSX from './psx-engine-dist.js';
import { gameStart as armaInimigoGameStart, gameLoop as armaInimigoGameLoop } from './entities/armaInimigo.js';
import { gameStart as enemyGameStart, gameLoop as enemyGameLoop } from './entities/enemy.js';
import { gameStart as playerGameStart, gameLoop as playerGameLoop } from './entities/player.js';

function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
  armaInimigoGameStart();
  enemyGameStart();
  playerGameStart();

}

// Função que será chamada a cada frame
function gameLoop() {
  armaInimigoGameLoop();
  enemyGameLoop();
  playerGameLoop();

}

document.addEventListener('DOMContentLoaded', start);