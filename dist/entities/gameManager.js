import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";

let player;
let enemies = []
let bullets = []

const bulletSpeed = 2;

export function gameStart() {
  
}

export function gameLoop() {
  moveEnemies();
  moveBullets();
}

export function setUpPlayer(p) {
  player = p;
}

export function addEnemy(e) {
  enemies.push(e);
}

export function removeEnemy(e) {
  const index = enemies.indexOf(e);

  if (index !== -1) {
    enemies.splice(index, 1);
    PSX.destroy(e.enemy);
  }
}

export function addBullet(b) {
  bullets.push(b);
}

export function removeBullet(b) {
  const index = bullets.indexOf(b);

  if (index !== -1) {
    bullets.splice(index, 1);
    PSX.destroy(b.mesh);
  }
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

function moveBullets() {
  // Atualizar projéteis
  bullets.forEach((bulletObj, index) => {
    const bullet = bulletObj.mesh;
    const direction = bulletObj.direction;

    //PSX.translate(bullet.model.position, "z", bulletSpeed);
    PSX.translateTo(bullet.model, direction, bulletSpeed);
    //bullet.position.addScaledVector(direction, 4 * 2);

    // Verificar colisões com inimigos
    enemies.forEach((enemy, enemyIndex) => {
      // Verificar colisão
      if (PSX.distance(bullet.model, enemy.enemy.model) < 4) {
        //createExplosion(enemy.enemy.model.position);
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gamepad = gamepads[i];
          if (gamepad && gamepad.vibrationActuator) {
            // Se houver suporte para vibração, ative
            gamepad.vibrationActuator.playEffect("dual-rumble", {
              startDelay: 0,
              duration: 500, // Duração da vibração em milissegundos
              weakMagnitude: 1.0, // Intensidade da vibração leve
              strongMagnitude: 1.0, // Intensidade da vibração forte
            });
          }
        }

        // Remove a classe shake após a animação
        setTimeout(() => {
          //document.querySelector(".effect-container").classList.remove("shake");
        }, 300); // Tempo igual ao da animação

        // Remover projétil e inimigo

        bullets.splice(index, 1);

        enemies.splice(enemyIndex, 1);
        PSX.destroy(bullet);
        PSX.destroy(enemy.enemy);
      }
    });
  });
}