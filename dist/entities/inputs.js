import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";

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

export function gameStart() {

}

export function gameLoop() {

}

export function inputs(player) {
  const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      const gp = gamepads[0];

      if (gp.buttons[2].pressed) {
        //toggleCrtFX();
      }

      // Eixo horizontal
      if (gp.axes[0] < -0.5) {
        if (player.model.position.x > minX) {
          PSX.translate(player.model.position, "x", -speed);
        }

        if (player.model.rotation.z < 1) {
          targetRoll = -rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (gp.axes[0] > 0.5) {
        if (player.model.position.x < maxX) {
          PSX.translate(player.model.position, "x", speed);
        }

        if (player.model.rotation.z > -1) {
          targetRoll = rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (Math.abs(gp.axes[0]) > -0.5 && Math.abs(gp.axes[0]) < 0.5) {
        targetRoll = 0; // Resetar a rotação alvo se não houver entrada
      }

      // Suavizar a rotação em z
      player.model.rotation.z =
      player.model.rotation.z +
        (targetRoll * 5 - player.model.rotation.z) * 0.1;

      // Eixo vertical
      if (gp.axes[1] > 0.5) {
        if (player.model.position.y < maxY) {
          PSX.translate(player.model.position, "y", speed / 2);
          if (player.model.rotation.x < maxAngle) {
            targetPitch = rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (gp.axes[1] < -0.5) {
        if (player.model.position.y > minY) {
          PSX.translate(player.model.position, "y", -(speed / 2));
          if (player.model.rotation.x > minAngle) {
            targetPitch = -rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (Math.abs(gp.axes[1]) < 0.5) {
        targetPitch = 0; // Resetar a rotação alvo se não houver entrada
      }

      player.model.rotation.x =
      player.model.rotation.x +
        (targetPitch - player.model.rotation.x) * 0.1;

        player.model.rotation.y = Math.PI;
      // Botão de disparo (botão A do controle Xbox)
      if (gp.buttons[0].pressed) {
        player.components.playerShoot();
      }
    }
}