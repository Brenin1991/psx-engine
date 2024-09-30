import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";

let bullets = [];

const bulletSpeed = 2;

const bulletMesh = PSX.createSphere(0.1, 8, 8, 0xffa500);

export function gameStart() {
  // Inicialização do componente
}

export function gameLoop() {
  moveBullets();
}

export function shoot(player) {
  const bullet = bulletMesh.clone();

  // Posicione a bala na posição do avião
  bullet.position.copy(player.model.position);

  const bulletDirection = new Vector3(0, 0, 1); // A bala é disparada para frente
  bulletDirection.applyQuaternion(player.model.quaternion); // Ajusta a direção com a rotação do avião


  // Adicionar a bala à cena e ao array de projéteis
  const bulletObj = PSX.instantiate(bullet);
  bullets.push({ mesh: bulletObj, direction: bulletDirection });

  // Tocar o som do disparo
  /*const shotSound = document.getElementById("shotSound");
  shotSound.currentTime = 0;
  shotSound.volume = 0.5;
  shotSound.play();*/
}

function moveBullets() {
  // Atualizar projéteis
  bullets.forEach((bulletObj, index) => {
    const bullet = bulletObj.mesh;
    const direction = bulletObj.direction;

    //PSX.translate(bullet.model.position, "z", bulletSpeed);
    PSX.translateTo(bullet.model, direction, bulletSpeed);
    //bullet.position.addScaledVector(direction, 4 * 2);
/*
    // Verificar colisões com inimigos
    enemies.forEach((enemy, enemyIndex) => {
      // Verificar colisão
      if (bullet.position.distanceTo(enemy.enemy.position) < 4) {
        createExplosion(enemy.enemy.position);
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
          document.querySelector(".effect-container").classList.remove("shake");
        }, 300); // Tempo igual ao da animação

        // Remover projétil e inimigo

        bullets.splice(index, 1);

        enemies.splice(enemyIndex, 1);
        scene.remove(bullet);
        scene.remove(enemy.enemy);
      }
    });*/
  });
}