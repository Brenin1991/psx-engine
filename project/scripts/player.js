import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';
import { inputs } from "./inputs.js";
import { shoot } from "./playerShoot.js";
import * as gameManager from "./gameManager.js";

let playerModel;
let playerObject;

// Função gameStart atualizada para encontrar o player no início
export function gameStart() {
  PSX.findObjectByName('player', (foundObject) => {
    if (foundObject) {
      console.log('Player encontrado no gameStart.');
      playerObject = foundObject;
      playerObject.addComponent('playerShoot', playerShoot);
      gameManager.setUpPlayer(playerObject);
    //  resolve();  // Resolve a Promise indicando que o player foi encontrado e configurado
    } else {
      console.log('Erro: Player não encontrado.');
     // reject(new Error('Player não encontrado'));
    }
  });
}

// Função gameLoop que só controla o player se ele já foi inicializado no gameStart
export function gameLoop() {
 
}

// Função para carregar o modelo do player (caso precise usar isso no futuro)
function loadModel() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB(
    "f16.glb",
    scale,
    position,
    rotation,
    (loadedModel) => {
      playerModel = loadedModel;
      playerObject = PSX.instantiate(playerModel, 'player');
      playerObject.addComponent('playerShoot', playerShoot);
      gameManager.setUpPlayer(playerObject);
    }
  );
}

// Função do player para atirar (pode ser chamado de outro lugar)
function playerShoot() {
  shoot(playerObject); // Função que lida com os tiros do player
}
