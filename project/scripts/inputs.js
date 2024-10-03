import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import * as gameManager from "./gameManager.js";

const speed = 0.4;
let maxX = 25,
  maxY = 40,
  minX = -25,
  minY = 1;
let rollAngle = 0.2;
let rollVertical = 0.2,
  maxAngle = 1,
  minAngle = -1;
let targetRoll;
let targetPitch;

let player;

export function gameStart() {

}

export function gameLoop() {
  player = gameManager.getPlayer();
  if(player) {
    inputs();
  }
}

export function inputs() {
  const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      const gp = gamepads[0];

      if (gp.buttons[2].pressed) {
        //toggleCrtFX();
      }

      // Eixo horizontal
      if (gp.axes[0] < -0.5) {
        if (player.gameObject.position.x > minX) {
          PSX.translate(player.gameObject.position, "x", -speed);
        }

        if (player.gameObject.rotation.z < 1) {
          targetRoll = -rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (gp.axes[0] > 0.5) {
        if (player.gameObject.position.x < maxX) {
          PSX.translate(player.gameObject.position, "x", speed);
        }

        if (player.gameObject.rotation.z > -1) {
          targetRoll = rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (Math.abs(gp.axes[0]) > -0.5 && Math.abs(gp.axes[0]) < 0.5) {
        targetRoll = 0; // Resetar a rotação alvo se não houver entrada
      }

      // Suavizar a rotação em z
      player.gameObject.rotation.z =
      player.gameObject.rotation.z +
        (targetRoll * 5 - player.gameObject.rotation.z) * 0.1;

      // Eixo vertical
      if (gp.axes[1] > 0.5) {
        if (player.gameObject.position.y < maxY) {
          PSX.translate(player.gameObject.position, "y", speed / 2);
          if (player.gameObject.rotation.x < maxAngle) {
            targetPitch = rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (gp.axes[1] < -0.5) {
        if (player.gameObject.position.y > minY) {
          PSX.translate(player.gameObject.position, "y", -(speed / 2));
          if (player.gameObject.rotation.x > minAngle) {
            targetPitch = -rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (Math.abs(gp.axes[1]) < 0.5) {
        targetPitch = 0; // Resetar a rotação alvo se não houver entrada
      }

      player.gameObject.rotation.x =
      player.gameObject.rotation.x +
        (targetPitch - player.gameObject.rotation.x) * 0.1;

        player.gameObject.rotation.y = Math.PI;
      // Botão de disparo (botão A do controle Xbox)
      if (gp.buttons[0].pressed) {
        player.components.playerShoot();
        player.components.playerJump();
      }
    }
}