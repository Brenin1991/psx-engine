import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";
import * as gameManager from "./gameManager.js";

const bulletMesh = PSX.createSphere(0.1, 8, 8, 0xffa500);

export function gameStart() {
}

export function gameLoop() {

}

export function shoot(player) {
  const bullet = bulletMesh.clone();

  bullet.position.copy(player.model.position);

  const bulletDirection = new Vector3(0, 0, 1);
  bulletDirection.applyQuaternion(player.model.quaternion);

  const bulletObj = PSX.instantiate(bullet);

  const b = { mesh: bulletObj, direction: bulletDirection }

  destroyBullet(b);

  gameManager.addBullet(b);

  // Tocar o som do disparo
  /*const shotSound = document.getElementById("shotSound");
  shotSound.currentTime = 0;
  shotSound.volume = 0.5;
  shotSound.play();*/
}

function destroyBullet(bullet) {
  setTimeout(() => {
    gameManager.removeBullet(bullet)
  }, 5000);
}