import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { inputs } from "./inputs.js";
import { shoot } from "./playerShoot.js";
import * as gameManager from "./gameManager.js";

let playerModel;
let playerObject;

export function gameStart() {
  loadModel();
}

export function gameLoop() {
    PlayerController();
}

function loadModel() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB(
    "./assets/models/f16.glb",
    scale,
    position,
    rotation,
    (loadedModel) => {
      playerModel = loadedModel;
      playerObject = PSX.instantiate(playerModel, "player", "player");
      playerObject.addComponent('playerShoot', playerShoot);
      gameManager.setUpPlayer(playerObject);
    }
  );
}

function PlayerController() {
  if (playerObject) {
    inputs(playerObject);
  }
}

function playerShoot() {
  shoot(playerObject);
}
