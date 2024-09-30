import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Importando o GLTFLoader

// Variáveis globais do engine
let scene, camera, renderer;
let gameStartFunction = null; // Variável para armazenar o callback do gameStart
let gameLoopFunction = null; // Variável para armazenar o callback do gameLoop
const modelLoader = new GLTFLoader();
const keysPressed = {}; // Armazena o estado das teclas pressionadas

const fileSystem = {
  models: "models",
  sounds: "sounds",
  texture: "textures",
  scripts: "scripts",
};

let idCounter = 0; // Contador para gerar IDs únicos

let timeMulti = 1;

let sceneObjects = [];

// Inicializa a cena, câmera e renderizador
export function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
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
        this.components[name] = component.bind(this);
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

export function translateTo(model, target, velocity) {
  model.position.addScaledVector(target, velocity * timeMulti);
}

export function trackTo(origin, target) {
  let direction = new THREE.Vector3();
  direction.subVectors(origin.position, target.position).normalize();

  return direction;
}

export function distance(origin, target) {
  const dist = origin.position.distanceTo(target.position);

  return dist;
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

  // Método para aplicar um quaternion ao vetor
  applyQuaternion(quaternion) {
    const x = this.x, y = this.y, z = this.z;
    const qx = quaternion.x, qy = quaternion.y, qz = quaternion.z, qw = quaternion.w;

    // Calcular o produto do quaternion
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // Calcular o resultado final após a rotação
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }
}


export function createSphere(r, h, v, c) {
  let sphereGeometry = new THREE.SphereGeometry(r, h, v);
  let material = new THREE.MeshBasicMaterial({ color: c });
  let sphere = new THREE.Mesh(sphereGeometry, material);

  return sphere;
}


const smokeTexture = loadTexture("smoke.png");
const fireTexture = loadTexture("explosion.png");

const smokeGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const fireGeometry = new THREE.SphereGeometry(0.5, 8, 8);

// Criar o material da fumaça uma vez
const smokeMaterial = new THREE.MeshBasicMaterial({
  map: smokeTexture, // Aplique a textura
  transparent: true,
  opacity: 1,
});

// Criar o material da chama com cor amarelada uma vez
const fireMaterial = new THREE.MeshBasicMaterial({
  map: fireTexture,
  transparent: true,
  opacity: 1,
});

 //PARTICULAS (FUTURO PARTICLES SYSTEM)
export function createSmokeTrail(position, color) {
  const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
  const fire = new THREE.Mesh(fireGeometry, fireMaterial.clone());

  // Definir a posição inicial da fumaça e da chama como a posição do projétil
  smoke.position.copy(position);
  fire.position.copy(position);

  // Adicionar a fumaça e a chama à cena
  scene.add(smoke);
  scene.add(fire);

  // Tornar a fumaça gradualmente mais transparente e removê-la após um tempo
  const fadeDuration = 1000; // Tempo em milissegundos antes de remover a fumaça
  const fadeInterval = setInterval(() => {
    smoke.material.opacity -= 0.04; // Diminuir a opacidade gradualmente
    if (smoke.material.opacity <= 0) {
      clearInterval(fadeInterval); // Parar a redução de opacidade
      scene.remove(smoke); // Remover a fumaça da cena
    }
  }, 50); // Atualiza a cada 50ms para um fade suave

  // Tornar a chama mais transparente rapidamente e removê-la após um tempo
  const fireFadeDuration = 100; // A chama desaparece mais rapidamente
  const fireFadeInterval = setInterval(() => {
    fire.material.opacity -= 0.8; // Diminui a opacidade mais rápido que a fumaça
    if (fire.material.opacity <= 0) {
      clearInterval(fireFadeInterval); // Parar a redução de opacidade
      scene.remove(fire); // Remover a chama da cena
    }
  }, 20); // Atualiza a cada 50ms
}

function loadTexture(name) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(fileSystem.texture + "/" + name);

  return texture;
}

export function createExplosion(position) {
  const explosionMaterial = new THREE.MeshPhongMaterial({
    map: fireTexture, // Textura
    emissive: new THREE.Color(0xffa500),
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 1,
    alphaTest: 0.5,
  });

  // Criar a malha da explosão e aplicar o material
  const explosion = new THREE.Mesh(
    new THREE.SphereGeometry(5, 10, 10),
    explosionMaterial // Use o material com a textura aqui
  );
  explosion.position.copy(position);
  //explosion.lookAt(camera);
  //explosions.push(explosion);
  scene.add(explosion);

  /*
  // Tocar som de explosão
  const explosionSound = document.getElementById("explosionSound");
  explosionSound.currentTime = 0;
  explosionSound.play();*/

  // Remover explosão após 0.5 segundos
  setTimeout(() => {
    console.log('remover explosão');
    scene.remove(explosion);
    //explosions.splice(explosions.indexOf(explosion), 1);
  }, 500);
}



