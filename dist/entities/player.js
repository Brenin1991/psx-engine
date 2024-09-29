import { isKeyPressed, translate } from '../psx-engine-dist.js'; // Importando funções da engine
import { LoadModelGLB, instantiate } from '../psx-engine-dist.js'; // Funções para carregar e instanciar o modelo
import Vector3 from '../js/utils.js';

let playerModel;
let speed = 0.1;

export function loadPlayer() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    playerModel = loadedModel;
    instantiate(playerModel);
  });
}

export function movePlayer() {
  if (!playerModel) return;

  if (isKeyPressed('w')) {
    translate(playerModel.position, "y", -speed);
  }
  if (isKeyPressed('s')) {
    translate(playerModel.position, "y", speed);
  }
  if (isKeyPressed('a')) {
    translate(playerModel.position, "x", -speed);
  }
  if (isKeyPressed('d')) {
    translate(playerModel.position, "x", speed);
  }
}
