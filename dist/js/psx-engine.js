import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Importando o GLTFLoader

// Variáveis globais do engine
let scene, camera, renderer;

const modelLoader = new GLTFLoader(); // Use GLTFLoader aqui

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
  camera.position.z = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Adiciona luz ambiente
  const ambientLight = new THREE.AmbientLight(0x404040); // Luz suave e difusa
  scene.add(ambientLight);

  // Adiciona luz direcional
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz branca
  directionalLight.position.set(5, 5, 5); // Posição da luz
  scene.add(directionalLight);

  // Função de animação
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}

// Adiciona um modelo à cena
export function instantiate(model) {
  scene.add(model); // Adiciona o modelo carregado à cena
}

// Carrega um modelo GLB
export function LoadModelGLB(url, scale, position, rotation, callback) {
  modelLoader.load(url, (gltf) => {
    const model = gltf.scene; // Obtém a cena do modelo carregado
    scale = new THREE.Vector3(0.01, 0.01, 0.01); // Exemplo de escala
    // Aplica transformação ao modelo
    model.scale.copy(scale);
    model.position.copy(position);
    model.rotation.set(rotation.x, rotation.y, rotation.z);

    callback(model); // Chama o callback com o modelo carregado
  }, undefined, (error) => {
    console.error('Erro ao carregar o modelo:', error);
  });
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
