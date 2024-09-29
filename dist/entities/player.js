import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";

let playerModel;
let playerObject;
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
let targetPitch; // exemplo de valor para o pitch

export function gameStart() {
  loadModel();
}

export function gameLoop() {
  handleGamepadInput();
}

function loadModel() {
  const scale = new Vector3(0.01, 0.01, 0.01);
  const position = new Vector3(0, 0, 0);
  const rotation = new Vector3(0, Math.PI, 0);

  PSX.LoadModelGLB(
    "./models/f16.glb",
    scale,
    position,
    rotation,
    (loadedModel) => {
      playerModel = loadedModel;
      playerObject = PSX.instantiate(playerModel, "player", "player");
      console.log(playerObject.getSceneId()); // Acessa o ID
    }
  );
}

function handleGamepadInput() {
  if (playerObject) {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      const gp = gamepads[0];

      if (gp.buttons[2].pressed) {
        //toggleCrtFX();
      }

      // Eixo horizontal
      if (gp.axes[0] < -0.5) {
        if (playerObject.model.position.x > minX) {
          PSX.translate(playerObject.model.position, "x", -speed);
        }

        if (playerObject.model.rotation.z < 1) {
          targetRoll = -rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (gp.axes[0] > 0.5) {
        if (playerObject.model.position.x < maxX) {
          PSX.translate(playerObject.model.position, "x", speed);
        }

        if (playerObject.model.rotation.z > -1) {
          targetRoll = rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (Math.abs(gp.axes[0]) > -0.5 && Math.abs(gp.axes[0]) < 0.5) {
        targetRoll = 0; // Resetar a rotação alvo se não houver entrada
      }

      // Suavizar a rotação em z
      playerObject.model.rotation.z =
        playerObject.model.rotation.z +
        (targetRoll * 5 - playerObject.model.rotation.z) * 0.1;

      // Eixo vertical
      if (gp.axes[1] > 0.5) {
        if (playerObject.model.position.y < maxY) {
          PSX.translate(playerObject.model.position, "y", speed / 2);
          if (playerObject.model.rotation.x < maxAngle) {
            targetPitch = rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (gp.axes[1] < -0.5) {
        if (playerObject.model.position.y > minY) {
          PSX.translate(playerObject.model.position, "y", -(speed / 2));
          if (playerObject.model.rotation.x > minAngle) {
            targetPitch = -rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (Math.abs(gp.axes[1]) < 0.5) {
        targetPitch = 0; // Resetar a rotação alvo se não houver entrada
      }

      playerObject.model.rotation.x =
        playerObject.model.rotation.x +
        (targetPitch - playerObject.model.rotation.x) * 0.1;

      playerObject.model.rotation.y = Math.PI;
      // Botão de disparo (botão A do controle Xbox)
      if (gp.buttons[0].pressed) {
        //shoot();
      }
    }
  }
}
