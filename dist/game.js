import * as PSX from './psx-engine-dist.js';
import { gameStart as cameraControllerGameStart, gameLoop as cameraControllerGameLoop } from './entities/cameraController.js';
import { gameStart as enemyGameStart, gameLoop as enemyGameLoop } from './entities/enemy.js';
import { gameStart as floorGameStart, gameLoop as floorGameLoop } from './entities/floor.js';
import { gameStart as inputsGameStart, gameLoop as inputsGameLoop } from './entities/inputs.js';
import { gameStart as playerGameStart, gameLoop as playerGameLoop } from './entities/player.js';
import { gameStart as playerShootGameStart, gameLoop as playerShootGameLoop } from './entities/playerShoot.js';

function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
  cameraControllerGameStart();
  enemyGameStart();
  floorGameStart();
  inputsGameStart();
  playerGameStart();
  playerShootGameStart();

}

// Função que será chamada a cada frame
function gameLoop() {
  cameraControllerGameLoop();
  enemyGameLoop();
  floorGameLoop();
  inputsGameLoop();
  playerGameLoop();
  playerShootGameLoop();

}

document.addEventListener('DOMContentLoaded', start);