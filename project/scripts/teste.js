import * as PSX from '../engine/psx-engine-dist.js';
import Vector3 from "../engine/psx-engine-dist.js";
import { initializeWithRetry } from '../engine/initialization.js';

export function gameStart() {
  // Inicialização do script
  initializeWithRetry(() => {
      // Evita repetição durante a inicialização
  });
}

export function gameLoop() {
  // Lógica do loop do script
}