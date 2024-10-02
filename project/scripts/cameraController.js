import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import * as gameManager from "./gameManager.js";

let camera;
let player;
export function gameStart() {
  
}

export function gameLoop() {
  player = gameManager.getPlayer();
  camera = PSX.getCamera();
  if(player) {
    camera.lookAt(player.gameObject.position);
    playerCamera();
  }
}

function playerCamera() {
  // Fixar câmera no avião com suavidade (usando "lerp")
  const desiredCameraPosition = new Vector3(
    player.gameObject.position.x,
    player.gameObject.position.y + 2.5,
    player.gameObject.position.z + 9
  );
  const look = new Vector3(
    player.gameObject.position.x,
    player.gameObject.position.y,
    player.gameObject.position.z
  );
  camera.position.lerp(desiredCameraPosition, 0.4); // Lerp para suavidade
  //camera.lookAt(look);
}