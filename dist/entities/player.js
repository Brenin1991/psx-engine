import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";

let playerModel;
let playerObject;
const speed = 0.1;

export function gameStart() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    playerModel = loadedModel;
    playerObject = PSX.instantiate(playerModel, 'player', 'player');
    console.log(playerObject.getSceneId()); // Acessa o ID
  });
}

export function gameLoop() {
  if (!playerObject) return;

  if (PSX.isKeyPressed('w')) {
    PSX.translate(playerObject.model.position, 'y', -speed);
  }
  if (PSX.isKeyPressed('s')) {
    PSX.translate(playerObject.model.position, 'y', speed);
  }
  if (PSX.isKeyPressed('a')) {
    PSX.translate(playerObject.model.position, 'x', -speed);
  }
  if (PSX.isKeyPressed('d')) {
    PSX.translate(playerObject.model.position, 'x', speed);
  }

  if (PSX.isKeyPressed('m')) {
    PSX.destroy(playerObject);
  }
}
