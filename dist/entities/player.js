import * as PSX from "../psx-engine-dist.js";
import Vector3 from "../psx-engine-dist.js";
import { inputs } from "./inputs.js";

let playerModel;
let playerObject;

export function gameStart() {
  loadModel();
}

export function gameLoop() {
    PlayerController();
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

function PlayerController() {
  if (playerObject) {
    inputs(playerObject);
  }
}
