import * as PSX from './psx-engine-dist.js';
import { gameStart as cameraControllerGameStart, gameLoop as cameraControllerGameLoop } from './editor/cameraController.js';


let sceneLoad;

async function start() {
  
  //PSX.init(); // Inicializa a engine

  // Um delay aqui, por exemplo 5 segundos (5000 milissegundos)
  await delay(20000);
  
  // Carregar o projeto e esperar que o carregamento finalize antes de continuar
  //await loadProject();

  console.log('Projeto carregado com sucesso, iniciando gameStart.');
  
  PSX.setEditorGameStart(gameStart);
  PSX.setEditorGameLoop(gameLoop);
  // Inicia o gameStart após o projeto ser carregado
  await gameStart();

  // Agora o jogo continua normalmente
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função que será chamada no primeiro frame
async function gameStart() {
// Espera todas as funções gameStart terminarem antes de iniciar o loop do jogo
  await Promise.all([
    cameraControllerGameStart()
  ]);
  console.log('Todos os componentes carregados!');
}

// Função que será chamada a cada frame
async function gameLoop() {
    cameraControllerGameLoop();
}


document.addEventListener('DOMContentLoaded', start);

// Função para salvar o projeto
function saveProject() {
  const sceneJson = PSX.saveProject();
  window.electron.saveProject(sceneJson); // Enviando o JSON para o processo principal
}

// Receber resposta do processo principal
window.electron.onSaveProjectReply((response) => {
  console.log(response.message); // Log da resposta
});

async function loadProject() {
  return new Promise((resolve, reject) => {
    window.electron.loadProject();

    // Escutar a resposta do processo principal
    window.electron.onLoadProjectReply((response) => {
      console.log(response.message);
      if (response.data) {
        // Aqui você pode usar os dados do projeto como desejar
        console.log('Dados do projeto:', response.data);
        sceneLoad = response.data;
        PSX.loadProject(sceneLoad);
        resolve(); // Resolve a promessa quando o projeto for carregado
      } else {
        reject(new Error('Falha ao carregar o projeto.'));
      }
    });
  });
}