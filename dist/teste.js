import { init, LoadModelGLB, instantiate, translate, setGameLoop, setGameStart, isKeyPressed } from './psx-engine-dist.js';
import Vector3 from './js/utils.js';

function start() {
  setGameStart(gameStart);
  setGameLoop(gameLoop);
}

// Função que será chamada no primeiro frame
function gameStart() {
    loadPlayer()
}

// Função que será chamada a cada frame
function gameLoop() {
}

function loadPlayer() {
    const scale = new Vector3(0.01, 0.01, 0.01);
    const position = new Vector3(0.5, 0, 0);
    const rotation = new Vector3(0, Math.PI / 2, 0);

    LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
        model = loadedModel; // Armazena o modelo carregado
        instantiate(model); // Instancia o modelo carregado
    });
    }

document.addEventListener('DOMContentLoaded', start);
