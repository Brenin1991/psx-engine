import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Importando o GLTFLoader

// Variáveis globais do engine
let scene, camera, renderer;
let gameStartFunction = null; // Variável para armazenar o callback do gameStart
let gameLoopFunction = null; // Variável para armazenar o callback do gameLoop
const modelLoader = new GLTFLoader();
const keysPressed = {}; // Armazena o estado das teclas pressionadas

let idCounter = 0; // Contador para gerar IDs únicos

let timeMulti = 1;

let sceneObjects = [];

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

  if(gameStartFunction) {
    gameStartFunction(); // Chama o loop do jogo a cada frame
  }

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
// Adiciona um modelo à cena
export function instantiate(model, name, type) {
  const newObj = model.clone();
  idCounter++; // Incrementa o contador para cada nova instância

  let sceneObject = {
    id: idCounter, // Atribui um ID único
    name: name,
    model: newObj,
    type: type,
    components: {}, // Armazena componentes como um objeto
  
    // Método para acessar o ID
    getSceneId: function() {
      return this.id;
    },
  
    // Método para acessar o nome
    getSceneName: function() {
      return this.name;
    },
  
    // Método para adicionar um componente
    addComponent: function(name, component) {
      if (typeof component === 'function') {
        this.components[name] = component.bind(this); // Adiciona o componente como um método
        console.log(`Componente adicionado: ${name}`);
      } else {
        console.log('O componente deve ser uma função.');
      }
    },
  
    // Método para remover um componente
    removeComponent: function(name) {
      if (this.components[name]) {
        delete this.components[name]; // Remove o componente pelo nome
        console.log(`Componente removido: ${name}`);
      } else {
        console.log('Componente não encontrado.');
      }
    }
  };

  sceneObjects.push(sceneObject);
  scene.add(sceneObject.model);

  return sceneObject;
}

export function findObjectById(id) {
  for (let sceneObject of sceneObjects) {
    if (sceneObject.id === id) {
      return sceneObject; // Retorna o objeto se o ID corresponder
    }
  }
  return null; // Retorna null se nenhum objeto for encontrado
}

// Encontra um objeto na coleção pelo nome
export function findObjectByName(name, callback) {
  for (let sceneObject of sceneObjects) {
    if (sceneObject.name === name) {
      if (callback && typeof callback === 'function') {
        callback(sceneObject); // Chama o callback passando o objeto encontrado
      }
      return sceneObject; // Retorna o objeto se o nome corresponder
    }
  }
  
  if (callback && typeof callback === 'function') {
    callback(null); // Chama o callback com null se nenhum objeto for encontrado
  }
  
  return null; // Retorna null se nenhum objeto for encontrado
}



// Remove um modelo da cena
export function destroy(sceneObject) {
  // Verifica se o objeto existe na coleção
  const index = sceneObjects.indexOf(sceneObject);
  
  if (index !== -1) {
    // Remove o modelo da cena
    scene.remove(sceneObject.model);
    
    // Remove o objeto da coleção
    sceneObjects.splice(index, 1);

    console.log(`${sceneObject.name} foi removido da cena.`);
  } else {
    console.log(`${sceneObject.name} não está na cena.`);
  }
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

export function setGameStart(callback) {
  gameStartFunction = callback; // Define o callback do loop de jogo
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

// Vector3.js
export default class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Método para adição
  add(vector) {
    return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  // Método para subtração
  subtract(vector) {
    return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  // Método para multiplicação por um escalar
  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  // Método para obter a magnitude do vetor
  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  // Método para normalizar o vetor
  normalize() {
    const mag = this.magnitude();
    return new Vector3(this.x / mag, this.y / mag, this.z / mag);
  }
}

