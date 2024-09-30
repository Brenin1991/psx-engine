import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";
import * as gameManager from "./gameManager.js";
import * as enemyShoot from "./enemyShoot.js";

let tankModel, helicopterModel;
let enemies = [];

// Função que será chamada no primeiro frame
export function gameStart() {
  loadModel();
  spawnEnemies();
}

// Função chamada a cada frame
export function gameLoop() {

}

function loadModel() {
  PSX.LoadModelGLB(
    "./models/tank.glb",
    new Vector3(4, 4, 4),
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0),
    (loadedModel) => {
      tankModel = loadedModel;
    }
  );

  PSX.LoadModelGLB(
    "./models/helicopter.glb",
    new Vector3(0.01, 0.01, 0.01),
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0),
    (loadedModel) => {
      helicopterModel = loadedModel;
    }
  );
}

function spawnEnemies() {
    setInterval(function () {
      createEnemies(2, "tank", 0.4); // Exemplo: criar 5 inimigos a cada 3 segundos
    }, 5000);
  
    setInterval(function () {
      createEnemies(3, "helicopter", 1); // Exemplo: criar 5 inimigos a cada 3 segundos
    }, 8000);
  }

function createEnemies(numEnemies, type, velocity) {
  // Verificar o número atual de inimigos
  const currentEnemiesCount = enemies.length;
  const maxEnemiesCount = 10; // Limite máximo de inimigos

  // Calcular quantos novos inimigos podem ser criados
  const enemiesToCreate = Math.min(
    numEnemies,
    maxEnemiesCount - currentEnemiesCount
  );

  for (let i = 0; i < enemiesToCreate; i++) {
    let enemy;

    if (type == "plane") {
      enemy = enemyAirplane.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        2 + Math.random() * (30 - 1) + 2, // Posição Y levemente aleatória ao redor da altura do avião
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else if (type == "tank") {
      enemy = tankModel.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        0, // Posição Y levemente aleatória ao redor da altura do tanque
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else if (type == "helicopter") {
      enemy = helicopterModel.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        2 + Math.random() * (30 - 1) + 2, // Posição Y levemente aleatória ao redor da altura do helicóptero
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else {
      enemy = tankModel.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        0, // Posição Y levemente aleatória ao redor da altura do tanque
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    }

    const enemyObj = PSX.instantiate(enemy);

    enemyObj.addComponent('shoot', shoot);

    const e = { enemy: enemyObj, type: type, velocity: velocity };

    gameManager.addEnemy(e);
  }
}

function shoot(enemy) {
    enemyShoot.shootEnemy(enemy);
}
