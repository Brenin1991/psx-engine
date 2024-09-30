import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";
import * as gameManager from "./gameManager.js";

let missile;

export function gameStart() {
  loadModel();
}

export function gameLoop() {
  // Lógica do loop do componente
}

function loadModel() {
  const scale = new Vector3(0.02, 0.02, 0.02);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, 0, 0);

  PSX.LoadModelGLB(
    "./models/missile2.glb",
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

  const player = gameManager.getPlayer()
  
  // A posição inicial do tiro será a posição do inimigo
  bullet.position.copy(enemy.enemy.model.position);

  const direction = PSX.trackTo(player.model, enemy.enemy.model);
  
  const bulletObj = PSX.instantiate(bullet, 'enemybullet', 'enemybullet');

  bulletObj.model.lookAt(player.model.position);

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