
import * as PSX from './psx-engine-dist.js';
import { gameStart as cameraControllerGameStart, gameLoop as cameraControllerGameLoop } from '../scripts/cameraController.js';
import { gameStart as enemyGameStart, gameLoop as enemyGameLoop } from '../scripts/enemy.js';
import { gameStart as enemyShootGameStart, gameLoop as enemyShootGameLoop } from '../scripts/enemyShoot.js';
import { gameStart as floorGameStart, gameLoop as floorGameLoop } from '../scripts/floor.js';
import { gameStart as gameManagerGameStart, gameLoop as gameManagerGameLoop } from '../scripts/gameManager.js';
import { gameStart as inputsGameStart, gameLoop as inputsGameLoop } from '../scripts/inputs.js';
import { gameStart as playerGameStart, gameLoop as playerGameLoop } from '../scripts/player.js';
import { gameStart as playerShootGameStart, gameLoop as playerShootGameLoop } from '../scripts/playerShoot.js';

function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
  cameraControllerGameStart();
  enemyGameStart();
  enemyShootGameStart();
  floorGameStart();
  gameManagerGameStart();
  inputsGameStart();
  playerGameStart();
  playerShootGameStart();

}

// Função que será chamada a cada frame
function gameLoop() {
  cameraControllerGameLoop();
  enemyGameLoop();
  enemyShootGameLoop();
  floorGameLoop();
  gameManagerGameLoop();
  inputsGameLoop();
  playerGameLoop();
  playerShootGameLoop();

}

document.addEventListener('DOMContentLoaded', start);
