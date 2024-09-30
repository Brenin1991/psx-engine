import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";

let floorModel;
let floorObject;

const speed = 0.4;  

export function gameStart() {
  loadModel();
}

export function gameLoop() {
  moveFloor();
}

function loadModel() {
  const scale = new Vector3(1, 1, 1);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, 0, 0);

  PSX.LoadModelGLB('01.glb', scale, position, rotation, (loadedModel) => {
      floorModel = loadedModel;
      floorObject = PSX.instantiate(floorModel, 'floor', 'floor');
      console.log(floorObject.getSceneId()); // Acessa o ID
  });
}

function moveFloor() {
  if (floorObject.model) {
    PSX.translate(floorObject.model.position, "z", speed);
    if (floorObject.model.position.z > 500) floorObject.model.position.z = 0;
  }
}