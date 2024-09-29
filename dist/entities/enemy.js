import * as PSX from '../psx-engine-dist.js';
import Vector3 from '../js/utils.js';

let enemyModel;
let enemyObject;
const enemySpeed = 0.05;

export function loadEnemy() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(5, 0, 0);  // Inimigo começa numa posição diferente
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB('f16.glb', scale, position, rotation, (loadedModel) => {
    enemyModel = loadedModel;
    enemyObject = PSX.instantiate(enemyModel, 'enemy', 'enemy');
    console.log(enemyObject.getSceneId()); // Acessa o ID
    enemyObject.addComponent('mensagemInimigo', mensagemInimigo);
  });
}

export function moveEnemy() {
  if (!enemyModel) return;

  // Exemplo de movimentação simples para o inimigo
  PSX.translate(enemyObject.model.position, 'x', -enemySpeed);
}

function mensagemInimigo() {
    console.log('inimigo falando');
}
