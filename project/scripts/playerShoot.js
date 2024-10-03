import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import * as gameManager from "./gameManager.js";
import { Geometry } from "../engine/psx-engine-dist.js";

let geometry = new Geometry();
const bulletMesh = geometry.createSphere(0.1, 8, 8, 0xffa500);

let shootSFX;

export function gameStart() {
  shootSFX = PSX.audioPlayer('shot.wav');
}

export function gameLoop() {

}

export function shoot(player) {
  const bullet = bulletMesh.clone();

  bullet.position.copy(player.gameObject.position);

  const bulletDirection = new Vector3(0, 0, 1);
  bulletDirection.applyQuaternion(player.gameObject.quaternion);

  const bulletObj = PSX.instantiate(bullet, 'playerbullet');

  const b = { mesh: bulletObj, direction: bulletDirection }

  destroyBullet(b);

  gameManager.addBullet(b);

  // Tocar o som do disparo
  shootSFX.play();
}

function destroyBullet(bullet) {
  setTimeout(() => {
    gameManager.removeBullet(bullet)
  }, 5000);
}