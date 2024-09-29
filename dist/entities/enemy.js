import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";

let tankModel, helicopterModel;
let enemies = [];
let player;

// Função que será chamada no primeiro frame
export function gameStart() {
  loadModel();
  spawnEnemies();
}

// Função chamada a cada frame
export function gameLoop() {
    if(player) {
        moveEnemies();
    } else {
        findPlayer();
    }
}

function findPlayer () {
    PSX.findObjectByName('player', (playerObject) => {
        if (playerObject) {
        player = playerObject;
        console.log('achou o player');
        } else {
        console.warn('Player não encontrado');
        }
    });
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

// Função que movimenta o inimigo
function moveEnemies() {
  enemies.forEach((enemy, index) => {
    PSX.translate(enemy.enemy.model.position, "z", enemy.velocity);
    if (
        enemy.enemy.model.position.distanceTo(player.model.position) > 30 &&
        enemy.type != "tank"
      ) {
        enemy.enemy.model.lookAt(player.model.position); // Fazer o inimigo olhar para o avião
      } else {
        // Se a distância for menor ou igual a 5, o inimigo não seguirá mais o avião
        // Você pode deixá-lo seguir em linha reta ou congelar a rotação dele
        // Aqui, ele para de olhar o avião, mantendo a última direção
      }
      // enemy.lookAt(null);
      // Verificar se colidiu com o avião
      if (enemy.enemy.model.position.distanceTo(player.model.position) < 2) {
        // Criar explosão e finalizar jogo
       // createExplosion(enemy.enemy.position);
       // endGame();
      }

    // Remover inimigo se sair da tela (se passar do jogador)
    if (enemy.enemy.model.position.z > player.model.position.z + 10) {
      PSX.destroy(enemy.enemy);
      enemies.splice(index, 1);
    }
  });
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
    enemies.push({ enemy: enemyObj, type: type, velocity: velocity });
  }
}
