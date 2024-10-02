import * as PSX from '../engine/psx-engine-dist.js';
import { initializeWithRetry } from '../engine/initialization.js';
import Vector3 from "../engine/psx-engine-dist.js";

let player;
let enemies = []
let bullets = []
let enemyBullets = []

const bulletSpeed = 2;

let explosionSFX;

export function gameStart() {
  initializeWithRetry(() => {
    setEnemyShooting();
  });

  explosionSFX = PSX.audioPlayer('explosion.wav');
}

export function gameLoop() {
  moveEnemies();
  moveBullets();
  moveEnemyBullets();
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

export function addEnemyBullet(b) {
  enemyBullets.push(b);
}

export function removeEnemyBullet(b) {
  const index = enemyBullets.indexOf(b);

  if (index !== -1) {
    enemyBullets.splice(index, 1);
    PSX.destroy(b.mesh);
  }
}

export function getPlayer() {
  return player;
}

// Função que movimenta o inimigo
function moveEnemies() {
  enemies.forEach((enemy, index) => {
    PSX.translate(enemy.enemy.gameObject.position, "z", enemy.velocity);
    if (
        enemy.enemy.gameObject.position.distanceTo(player.gameObject.position) > 30 &&
        enemy.type != "tank"
      ) {
        enemy.enemy.gameObject.lookAt(player.gameObject.position); // Fazer o inimigo olhar para o avião
      } else {
        // Se a distância for menor ou igual a 5, o inimigo não seguirá mais o avião
        // Você pode deixá-lo seguir em linha reta ou congelar a rotação dele
        // Aqui, ele para de olhar o avião, mantendo a última direção
      }
      // enemy.lookAt(null);
      // Verificar se colidiu com o avião
      if (PSX.distance(enemy.enemy.gameObject, player.gameObject) < 2) {
        // Criar explosão e finalizar jogo
        PSX.createExplosion(enemy.enemy.position);
        explosionSFX.play();
       // endGame();
      }

    // Remover inimigo se sair da tela (se passar do jogador)
    if (enemy.enemy.gameObject.position.z > player.gameObject.position.z + 10) {
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

    //PSX.translate(bullet.gameObject.position, "z", bulletSpeed);
    PSX.translateTo(bullet.gameObject, direction, bulletSpeed);
    //bullet.position.addScaledVector(direction, 4 * 2);

    // Verificar colisões com inimigos
    enemies.forEach((enemy, enemyIndex) => {
      // Verificar colisão
      if (PSX.distance(bullet.gameObject, enemy.enemy.gameObject) < 4) {
        PSX.createExplosion(enemy.enemy.gameObject.position);
        explosionSFX.play();
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

// Função para mover os tiros inimigos em direção ao jogador
function moveEnemyBullets() {
  enemyBullets.forEach((bulletData, index) => {
    const bullet = bulletData.bullet;
    const direction = bulletData.target; // Usar a direção calculada no momento do disparo

    //const direction = PSX.trackTo(player.gameObject, bullet.gameObject);
    PSX.translateTo(bullet.gameObject, direction, 1.5);

    //bullet.gameObject.lookAt(direction);
    //PSX.createSmokeTrail(bullet.gameObject.position, "0x888888");
    // Verificar colisão com o avião do jogador
    if (PSX.distance(bullet.gameObject, player.gameObject) < 2) {
      // Causar dano ou finalizar o jogo
      PSX.createExplosion(player.gameObject.position);
      explosionSFX.play();
      // endGame();
      PSX.destroy(bullet)
      enemyBullets.splice(index, 1);
    }

    // Remover o projétil se sair da área de jogo
    if (
      bullet.gameObject.position.z > player.gameObject.position.z + 20 ||
      bullet.gameObject.position.z < player.gameObject.position.z - 100
    ) {
      PSX.destroy(bullet)
      enemyBullets.splice(index, 1);
    }
  });
}

function setEnemyShooting() {
  setInterval(() => {
    enemies.forEach((enemy) => {
      enemy.enemy.components.shoot(enemy);
    });
  }, 5000);
}