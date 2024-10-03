import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';
import { inputs } from "./inputs.js";
import { shoot } from "./playerShoot.js";
import * as gameManager from "./gameManager.js";
import { Physics } from "../engine/psx-engine-dist.js";

const physics = new Physics();

let playerModel;
let playerObject;
let playerPhysics;

let my_animator, my_animations;

let clock, delta;

// Função gameStart atualizada para encontrar o player no início
export function gameStart() {
  initializeWithRetry(() => {
    //loadModel();
  });
  
  
  PSX.findObjectByName('player', (foundObject) => {
    if (foundObject) {
      console.log('Player encontrado no gameStart.');
      playerObject = foundObject;
      playerObject.addComponent('playerShoot', playerShoot);
      playerObject.addComponent('playerJump', playerJump);
      gameManager.setUpPlayer(playerObject);

     // playerPhysics = physics.addBoxPhysics(playerObject.gameObject, 1, 1, 1, 0.1);
    //  resolve();  // Resolve a Promise indicando que o player foi encontrado e configurado
    } else {
      console.log('Erro: Player não encontrado.');
     // reject(new Error('Player não encontrado'));
    }
  });
}

// Função gameLoop que só controla o player se ele já foi inicializado no gameStart
export function gameLoop() {
  /*delta = PSX.getDelta();
  my_animations.forEach((clip) => {
    //animator.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity);
    console.log(clip.name);
   my_animator.clipAction(clip).play(); // Reproduz a animação
  });
  
  if(playerObject) {
    my_animator.update(delta); // Atualiza todas as animações ativas
    console.log(delta);
  }*/
  //playerObject.gameObject.position.copy(playerPhysics.position);
  //playerObject.gameObject.quaternion.copy(playerPhysics.quaternion);
}

// Função para carregar o modelo do player (caso precise usar isso no futuro)
function loadModel() {
  const scale = new Vector3(0.1, 0.1, 0.1);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB(
    "book.glb",
    scale,
    position,
    rotation,
    (loadedModel, animator, animations) => {
      playerModel = loadedModel;
      playerObject = PSX.instantiate(playerModel, 'player');
      playerObject.addComponent('playerShoot', playerShoot);
      gameManager.setUpPlayer(playerObject);

      my_animator = animator;
      my_animations = animations;

      my_animations.forEach((clip) => {
        //animator.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity);
        console.log(clip.name);
       my_animator.clipAction(clip).play(); // Reproduz a animação
      });
/*
      const animationNames = animations.map(clip => clip.name); // Coletar nomes das animações
       // Selecionar uma animação para começar
      const selectedAnimation = animationNames[0]; // Aqui escolhemos a primeira animação como exemplo
      const action = animator.clipAction(selectedAnimation);
      action.setLoop(THREE.LoopRepeat, Infinity); // LoopRepeat é o modo e Infinity significa que irá repetir indefinidamente
      action.play(); // Reproduz a animação*/
    }
  );
}

// Função do player para atirar (pode ser chamado de outro lugar)
function playerShoot() {
  shoot(playerObject); // Função que lida com os tiros do player
}

function playerJump() {
 // playerPhysics.velocity.y = 5; // Ajuste este valor conforme necessário para a altura do salto
}
