import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Importando o GLTFLoader

// Variáveis globais do engine
let scene, camera, renderer;
let gameLoopFunction = null; // Variável para armazenar o callback do gameLoop
const modelLoader = new GLTFLoader();
const keysPressed = {}; // Armazena o estado das teclas pressionadas

let timeMulti = 1;

// Inicializa a cena, câmera e renderizador
export function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.z = 15;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const ambientLight = new THREE.AmbientLight(0x404040); // Luz suave e difusa
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz branca
  directionalLight.position.set(5, 5, 5); // Posição da luz
  scene.add(directionalLight);

  // Adiciona listeners para as teclas
  document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
  });

  document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  });

  function animate() {
    requestAnimationFrame(animate);

    // Executa a função gameLoop() se ela foi definida
    if (gameLoopFunction) {
      gameLoopFunction(); // Chama o loop do jogo a cada frame
    }

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}

// Função para verificar se uma tecla está pressionada
export function isKeyPressed(key) {
  return keysPressed[key.toLowerCase()] === true;
}

// Adiciona um modelo à cena
export function instantiate(model) {
  scene.add(model);
}

// Carrega um modelo GLB
export function LoadModelGLB(url, scale, position, rotation, callback) {
  modelLoader.load(url, (gltf) => {
    const model = gltf.scene;

    if (model instanceof THREE.Object3D) {
      model.scale.set(scale.x, scale.y, scale.z);
      model.position.set(position.x, position.y, position.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    callback(model);
  }, undefined, (error) => {
    console.error('Erro ao carregar o modelo:', error);
  });
}

export function translate(object, axis, value) {
  if (value >= 0) {
    object[axis] += value * timeMulti; // Adiciona se for positivo ou zero
  } else {
    object[axis] += value * timeMulti; // Subtrai automaticamente se for negativo
  }
}


// Função para definir o gameLoop
export function setGameLoop(callback) {
  gameLoopFunction = callback; // Define o callback do loop de jogo
}

// Retorna a cena, câmera e renderizador (se necessário)
export function getScene() {
  return scene;
}

export function getCamera() {
  return camera;
}

export function getRenderer() {
  return renderer;
}
