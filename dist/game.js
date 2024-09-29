import { init, LoadModelGLB, instantiate, translate, setGameLoop, isKeyPressed } from './psx-engine-dist.js';
import Vector3 from './js/utils.js';

let model; // Variável para armazenar o modelo carregado
let speed = 0.1; // Velocidade de movimento do modelo

function start() {
  init(); // Inicializa o engine

  loadPlayer();

  // Define a função gameLoop que será chamada a cada frame
  setGameLoop(gameLoop);
}

// Função que será chamada a cada frame
function gameLoop() {
  movePlayer();
}

function loadPlayer() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    model = loadedModel; // Armazena o modelo carregado
    instantiate(model); // Instancia o modelo carregado
  });
}

function movePlayer() {
  if (!model) return; // Verifica se o modelo foi carregado

  // Movimentação com as teclas WASD
  if (isKeyPressed('w')) {
    translate( model.position, "y", -speed);
  }
  if (isKeyPressed('s')) {
    translate( model.position, "y", speed);
  }
  if (isKeyPressed('a')) {
    translate( model.position, "x", -speed);
  }
  if (isKeyPressed('d')) {
    translate( model.position, "x", speed);
  }
}

document.addEventListener('DOMContentLoaded', start);
