import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";
import * as gameManager from "./gameManager.js";

let camera;
let player;
export function gameStart() {
  
  camera = PSX.getCamera();
}

export function gameLoop() {
  if(player) {
    camera.lookAt(player.model.position);
    playerCamera();
  } else {
    player = gameManager.getPlayer();
  }
}

function playerCamera() {
  // Fixar câmera no avião com suavidade (usando "lerp")
  const desiredCameraPosition = new Vector3(
    player.model.position.x,
    player.model.position.y + 2.5,
    player.model.position.z + 9
  );
  const look = new Vector3(
    player.model.position.x,
    player.model.position.y,
    player.model.position.z
  );
  camera.position.lerp(desiredCameraPosition, 0.4); // Lerp para suavidade
  //camera.lookAt(look);
}