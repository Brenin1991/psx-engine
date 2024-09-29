import { LoadModelGLB, instantiate, translate } from '../psx-engine-dist.js'; // Importando funções da engine
import Vector3 from '../js/utils.js';

let enemyModel;
let speed = 0.05;

export function loadEnemy() {
  const scale = new Vector3(0.02, 0.02, 0.02);
  const position = new Vector3(5, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    enemyModel = loadedModel;
    instantiate(enemyModel);
  });
}

export function moveEnemy() {
  if (!enemyModel) return;

  // Exemplo de movimento simples de inimigo (pode adicionar IA ou lógica aqui)
  translate(enemyModel.position, "x", -speed);
}
