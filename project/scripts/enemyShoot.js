import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';
import * as gameManager from "./gameManager.js";

let missile;

export function gameStart() {
  initializeWithRetry(() => {
    loadModel();
  });
}

export function gameLoop() {
  // Lógica do loop do componente
}

function loadModel() {
  const scale = new Vector3(0.02, 0.02, 0.02);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, 0, 0);

  PSX.LoadModelGLB(
    "missile2.glb",
    scale,
    position,
    rotation,
    (loadedModel) => {
      missile = loadedModel;
    }
  );
}

export function shootEnemy(enemy) {
  const bullet = missile.clone();

  const player = gameManager.getPlayer();
  
  // A posição inicial do tiro será a posição do inimigo
  bullet.position.copy(enemy.enemy.gameObject.position);

  const direction = PSX.trackTo(player.gameObject, enemy.enemy.gameObject);
  
  const bulletObj = PSX.instantiate(bullet, 'enemybullet');

  bulletObj.gameObject.lookAt(player.gameObject.position);

  const b = { bullet: bulletObj, target: direction };

  destroyBullet(b);

  gameManager.addEnemyBullet(b);
  
/*
  const enemyShotSound = document.getElementById("enemyShotSound");
  enemyShotSound.currentTime = 0;
  enemyShotSound.volume = 0.3;
  enemyShotSound.play();*/
}

function destroyBullet(bullet) {
  setTimeout(() => {
    gameManager.removeEnemyBullet(bullet)
  }, 5000);
}