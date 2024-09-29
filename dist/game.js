import * as PSX from './psx-engine-dist.js';
import { loadPlayer, movePlayer } from './entities/player.js';
import { loadEnemy, moveEnemy } from './entities/enemy.js';

function start() {
  PSX.setGameStart(gameStart);
  PSX.setGameLoop(gameLoop);
  PSX.init(); // Inicializa a engine
}

// Função que será chamada no primeiro frame
function gameStart() {
  loadPlayer(); // Carrega o jogador
  loadEnemy();  // Carrega o inimigo
}

// Função que será chamada a cada frame
function gameLoop() {
  movePlayer(); // Movimenta o jogador
  moveEnemy();  // Movimenta o inimigo
}

document.addEventListener('DOMContentLoaded', start);
