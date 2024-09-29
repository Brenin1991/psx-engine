import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";

let enemyModel;
const enemySpeed = 0.05;
let enemies = [];

// Função que será chamada no primeiro frame
export function gameStart() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(5, 0, 0); // Inimigo começa numa posição diferente
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB("f16.glb", scale, position, rotation, (loadedModel) => {
    enemyModel = loadedModel;
  });

  // Cria um novo inimigo a cada 2 segundos
  setInterval(function () {
    instantiateEnemy();
  }, 2000);
}

// Função chamada a cada frame
export function gameLoop() {
  enemies.forEach((enemy) => {
    moveEnemy(enemy);
  });
}

// Função que movimenta o inimigo
function moveEnemy(enemy) {
  if (!enemy) return;
  PSX.translate(enemy.model.position, "x", -enemySpeed); // Movimenta o inimigo na direção negativa do eixo X
}

// Função que destrói o inimigo após 5 segundos
function mensagemInimigo(enemy) {
  setTimeout(function () {
    PSX.destroy(enemy); // Destrói o inimigo após o tempo definido
  }, 5000);
}

// Função que cria uma instância de um novo inimigo e adiciona o componente de mensagem
function instantiateEnemy() {
  const enemy = PSX.instantiate(enemyModel, "enemy", "enemy");
  
  // Adiciona o componente 'mensagemInimigo'
  enemy.addComponent("mensagemInimigo", mensagemInimigo);
  
  // Executa a função mensagemInimigo logo após a criação do inimigo
  enemy.components.mensagemInimigo(enemy);

  // Adiciona o inimigo à lista de inimigos
  enemies.push(enemy);
}
