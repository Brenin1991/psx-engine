import * as PSX from '../psx-engine-dist.js';
import Vector3 from '../js/utils.js';

let playerModel;
let playerObject;
const speed = 0.1;

export function loadPlayer() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    playerModel = loadedModel;
    playerObject = PSX.instantiate(playerModel, 'player', 'player');
    console.log(playerObject.getSceneId()); // Acessa o ID
  });
}

export function movePlayer() {
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

  if (PSX.isKeyPressed('n')) {
    let enemy = PSX.findObjectByName('enemy')
    console.log(enemy.components.mensagemInimigo());
  }

  if (PSX.isKeyPressed('r')) {
    let enemy = PSX.findObjectByName('enemy')
    enemy.removeComponent('mensagemInimigo');
  }
}
