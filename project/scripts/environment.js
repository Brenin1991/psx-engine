import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { Environment }  from "../engine/psx-engine-dist.js";
import { PostProcessing } from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';


const env = new Environment();
const pp = new PostProcessing();

let backgroundSFX;

export function gameStart() {
  backgroundSFX = PSX.audioPlayer('theme.mp3');
  backgroundSFX.setLoop(true);
  
  // Inicialização do script
  initializeWithRetry(() => {
    
  });

  env.setHDR('sky.hdr'); // Adiciona HDRI
  env.addDirectionalLight(0xffffff, 0.8, [5, 0, 7.5]); // Adiciona luz direcional
  //env.addAmbientLight(0xffffff, 0.5); // Adiciona luz ambiente
  env.addPointLight(); // Adiciona luz pontual
  env.setFog(0xffffff, 0.005); // Define nevoeiro

  //pp.addDepthOfField();
  pp.addBloom();
  //pp.addFilm();
  //pp.addDepthOfField();
  //pp.addMotionBlur();
  //pp.addVignette();

}

export function gameLoop() {
  // Lógica do loop do script
}