import { init, setGameLoop, setGameStart } from './psx-engine-dist.js';
import { loadPlayer, movePlayer } from './entities/player.js';
import { loadEnemy, moveEnemy } from './entities/enemy.js';

function start() {
  setGameStart(gameStart);
  setGameLoop(gameLoop);
  init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
  loadPlayer();
  loadEnemy();
}

// Função que será chamada a cada frame
function gameLoop() {
  movePlayer();
  moveEnemy();
}

document.addEventListener('DOMContentLoaded', start);