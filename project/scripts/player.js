import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';
import { inputs } from "./inputs.js";
import { shoot } from "./playerShoot.js";
import * as gameManager from "./gameManager.js";
import { Physics } from "../engine/psx-engine-dist.js";
import { Animation } from "../engine/psx-engine-dist.js";

const physics = new Physics();
const animation = new Animation();

let playerModel;
let playerObject;

let my_animations;

let clock, delta;

// Função gameStart atualizada para encontrar o player no início
export function gameStart() {
  initializeWithRetry(() => {
    loadModel();
  });
}

// Função gameLoop que só controla o player se ele já foi inicializado no gameStart
export function gameLoop() {
  if(playerObject.animator) {
    playerObject.animator.update(0.016); // Aproximadamente 60 fps
  }
  
  if(playerObject) {
    playerObject.gameObject.position.copy(playerObject.physics.position);
    playerObject.gameObject.quaternion.copy(playerObject.physics.quaternion);
  
    playerObject.physics.angularVelocity.set(0, 0, 0);
  }
}

// Função para carregar o modelo do player (caso precise usar isso no futuro)
function loadModel() {
  const scale = new Vector3(1, 1, 1);
  const position = new Vector3(0, 10, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB(
    "DRONE.glb",
    scale,
    position,
    rotation,
    (loadedModel, animations) => {
      playerModel = loadedModel;
      playerObject = PSX.instantiate(playerModel, 'player');
      playerObject.addComponent('playerShoot', playerShoot);
      playerObject.addComponent('playerJump', playerJump);
      gameManager.setUpPlayer(playerObject);

      playerObject.physics = physics.addBoxPhysics(playerObject.gameObject, 1, 1, 1, 2);
      playerObject.physics.fixedRotation = true;
      my_animations = animations;

      animation.playAnimation(animation.createAnimator(playerObject), my_animations[0]);
    }
  );
}

// Função do player para atirar (pode ser chamado de outro lugar)
function playerShoot() {
  shoot(playerObject); // Função que lida com os tiros do player
}

function playerJump() {
  playerObject.physics.velocity.y = 15; // Ajuste este valor conforme necessário para a altura do salto
}
