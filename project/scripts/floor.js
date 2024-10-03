import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';
import { Physics } from "../engine/psx-engine-dist.js";
import { Geometry } from "../engine/psx-engine-dist.js";

const physics = new Physics();
const geometry = new Geometry()

let floorModel;
let floorObject;

let floorPhysic;

let planeModel;
let planeObj;

const speed = 0.4;  

export function gameStart() {
  PSX.findObjectByName('floor', (foundObject) => {
    if (foundObject) {
      floorObject = foundObject;
    }
  });

  let planeObj = PSX.instantiate(geometry.createBox(100, 1, 100, 0xffa500), 'plane');
  planeObj.gameObject.visible = false; // Torna o objeto invisível
  planeObj.gameObject.rotation.x = -Math.PI / 2; 
  floorPhysic = physics.addBoxPhysics(planeObj.gameObject,100, 1, 100, 0);
  floorPhysic.friction = 0; // Atrito zero
}

export function gameLoop() {
  if(floorObject) {
    floorPhysic.friction = 0; // Atrito zero
    moveFloor();
  }
}

function loadModel() {
  const scale = new Vector3(1, 1, 1);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, 0, 0);

  PSX.LoadModelGLB('01.glb', scale, position, rotation, (loadedModel) => {
      floorModel = loadedModel;
      floorObject = PSX.instantiate(floorModel, 'floor');
      console.log(floorObject.getSceneId()); // Acessa o ID
  });
}

function moveFloor() {
  if (floorObject) {
    PSX.translate(floorObject.gameObject.position, "z", speed);
    if (floorObject.gameObject.position.z > 500) floorObject.gameObject.position.z = 0;
  }
}