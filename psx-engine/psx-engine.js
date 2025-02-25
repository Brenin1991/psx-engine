import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import Stats from 'stats.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
//import { DepthOfFieldPass } from 'three/examples/jsm/postprocessing/DepthOfFieldPass.js';
//import { MotionBlurPass } from 'three/examples/jsm/postprocessing/MotionBlurPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader.js';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import * as CANNON from 'cannon-es';
import { World, Body, Box, Sphere, Vec3 } from 'cannon-es'; // Cannon.js

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Variáveis globais do engine
let scene, camera, editorCamera, renderer, editorRenderer, composer, renderPass, fxaaPass, listener, world, clock, delta, canvas, editorCanvas;
let gameStartFunction = null; // Variável para armazenar o callback do gameStart
let gameLoopFunction = null; // Variável para armazenar o callback do gameLoop

let editorGameStartFunction = null; // Variável para armazenar o callback do gameStart
let editorGameLoopFunction = null; // Variável para armazenar o callback do gameLoop
const modelLoader = new GLTFLoader();
const keysPressed = {}; // Armazena o estado das teclas pressionadas

// Criação do Stats.js
const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: ms, 2: memória
document.body.appendChild(stats.dom);

// loaders
const rgbeLoader = new RGBELoader();
const audioLoader = new THREE.AudioLoader();

const fileSystem = {
  models: "./assets/models",
  sounds: "./assets/sounds",
  texture: "./assets/textures",
  scripts: "./scripts",
};

let timeMulti = 1;

let sceneObjects = [];
let prefabs = [];

let transformControls, gizmo;

function setUpRenderer() {
  // Cena
  scene = new THREE.Scene();
  
  // Câmera principal do jogo
  camera = new THREE.PerspectiveCamera(60, 640 / 480, 0.1, 300);
  camera.position.set(0, 3, 7);
  
  canvas = document.getElementById("gameCanvas");
  renderer = new THREE.WebGLRenderer({
    canvas,
    /*antialias: false, // Suaviza as bordas dos objetos
    stencil: false,
    depth: false,
    powerPreference: "high-performance", // Melhor desempenho gráfico
    alpha: true, // Se necessário para transparência do fundo
    precision: "highp", // Alta precisão nos shaders
    physicallyCorrectLights: true,
    outputEncoding: THREE.GammaEncoding,
    logarithmicDepthBuffer: false,*/
  });
  //renderer.setSize(640, 480);
  //renderer.toneMapping = THREE.ACESFilmicToneMapping;
 // renderer.toneMappingExposure = 2;
}

export function setUpEditor() {
  const editorCanvas = document.getElementById("editorCanvas");
  
  if (!editorCanvas) {
    console.error("O canvas do editor não foi encontrado!");
    return;
  }
  
  editorRenderer = new THREE.WebGLRenderer({
    canvas: editorCanvas,
  });
  editorRenderer.setSize(640, 480);
  
  // Configuração da câmera do editor
  editorCamera = new THREE.PerspectiveCamera(60, 640 / 480, 0.1, 1000);
  editorCamera.position.set(0, 5, 10); // Ajuste conforme necessário
  editorCamera.lookAt(0, 0, 0); // Olhe para o centro da cena
  
  // Adicione a cena e outros objetos que deseja renderizar no editor aqui

  // Configurar controles
  controls = new OrbitControls(editorCamera, editorCanvas);
  controls.enableDamping = true; // Efeito de amortecimento
  controls.dampingFactor = 0.25; // Fator de amortecimento

  transformControls = new TransformControls(editorCamera, editorCanvas);
  transformControls.renderOrder = 50; // Defina um valor alto para renderizar na frente
  scene.add(transformControls);
  scene.add(new THREE.AxesHelper(5))

  gizmo = transformControls.getHelper();
	scene.add( gizmo );

}
// Inicializa a cena, câmera e renderizador
export function init() {
  setUpRenderer();
 // setUpEditor();

  raycaster = new THREE.Raycaster();
   mouse = new THREE.Vector2();

  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  composer.addPass(fxaaPass);

  listener = new THREE.AudioListener();
  camera.add(listener);

  world = new World();
  world.gravity.set(0, -9.82, 0); // Definir gravidade para simular o eixo Y

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

  if(editorGameStartFunction) {
    editorGameStartFunction();
  }

  // Variável global para o relógio
  clock = new THREE.Clock();

  function animate() {
    stats.begin(); // Inicia a medição
    delta = clock.getDelta(); // Calcular o tempo delta

    // Executa a função gameLoop() se ela foi definida
    if (gameLoopFunction) {
      gameLoopFunction(); // Chama o loop do jogo a cada frame
    }

    if (editorGameLoopFunction) {
      editorGameLoopFunction(); // Chama o loop do jogo a cada frame
    }

    // Atualizar a física com um deltaTime (exemplo: 1/60 para 60 fps)
    const deltaTime = 1 / 60;
    // Atualizar o mundo físico
    world.step(deltaTime);

    // Sincronizar os objetos Three.js com Cannon.js
    world.bodies.forEach((body) => {
      if (body.threeObject) {
        body.threeObject.position.copy(body.position);
        body.threeObject.quaternion.copy(body.quaternion);
      }
    });
    
    if (editorRenderer && editorCamera) {
      editorRenderer.render(scene, editorCamera);
      if (controls) {
        controls.update(); // Atualiza os controles
      }

      if(transformControls && gizmo) {
        transformControls.update(); // Atualiza o gizmo
        if(attachObject) {
          gizmo.position.copy(transformControls.object.position);
        }
      }
    }
    renderer.render(scene, camera);
    stats.end(); // Inicia a medição
    requestAnimationFrame(animate);
  }

  animate();
}

// Função para verificar se uma tecla está pressionada
export function isKeyPressed(key) {
  return keysPressed[key.toLowerCase()] === true;
}

export function saveProject() {
  // Transformar a cena do Three.js em JSON
  const sceneJson = scene.toJSON();

  return sceneJson;
}

export function loadProject(sceneJson) {
  const loadedScene = new THREE.ObjectLoader().parse( sceneJson );
  //scene = new THREE.Scene();
  if (loadedScene.children.length > 0) {
    // Loop através de todos os filhos
    loadedScene.children.forEach((child) => {
      //console.log(child); // Exibe o objeto filho no console
      const obj = child.clone();
      console.log(obj);
      instantiate(obj, obj.name);
    });
  }
}

// Adiciona um modelo à cena
export function instantiate(model, name, type) {
  const newObj = model.clone();
  newObj.name = name;
  let sceneObject = {
    id: newObj.id, // Atribui um ID único
    name: newObj.name,
    gameObject: newObj,
    type: newObj.type,
    animator: null,
    physics: null,
    components: {}, // Armazena componentes como um objeto
  
    // Método para acessar o ID
    getGameObjectId: function() {
      return this.id;
    },
  
    // Método para acessar o nome
    getGameObjectName: function() {
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
  scene.add(sceneObject.gameObject);

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

export function findObjectByType(type, callback) {
  for (let sceneObject of sceneObjects) {
    if (sceneObject.type === type) {
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
    scene.remove(sceneObject.gameObject);
    
    // Remove o objeto da coleção
    sceneObjects.splice(index, 1);

    console.log(`${sceneObject.name} foi removido da cena.`);
  } else {
    console.log(`${sceneObject.name} não está na cena.`);
  }
}



// Carrega um modelo GLB
export function LoadModelGLB(url, scale, position, rotation, callback) {
  modelLoader.load(fileSystem.models + "/" + url, (gltf) => {
    const model = gltf.scene;

    // Configurar escala, posição e rotação
    if (model instanceof THREE.Object3D) {
      model.scale.set(scale.x, scale.y, scale.z);
      model.position.set(position.x, position.y, position.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);

      model.traverse((node) => {
        if (node.isMesh) {
          node.material = new THREE.MeshStandardMaterial({
            color: node.material.color,
            map: node.material.map,                    // Textura difusa
            normalMap: node.material.normalMap,        // Normal map
            roughnessMap: node.material.roughnessMap,  // Roughness map
            metalnessMap: node.material.metalnessMap,  // Metalness map
            emissiveMap: node.material.emissiveMap,    // Emissive map
            roughness: 0.5,
            metalness: 0.5
        });

            node.castShadow = true;    // O modelo projeta sombras
            node.receiveShadow = true; // O modelo também pode receber sombras, se necessário
        }
    });
    }
    const animations = gltf.animations; 

    console.log('Modelo:', gltf.scene);
    // Passar o modelo e o animator para o callback

    callback(model, animations);
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

export function rotate(object, axis, value) {
  if (value >= 0) {
    object.rotation[axis] += value * timeMulti; // Adiciona se for positivo ou zero
  } else {
    object.rotation[axis] += value * timeMulti; // Subtrai automaticamente se for negativo
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
/*
export function followTarget(origin, target) {
  let direction = new THREE.Vector3();
  direction.subVectors(origin.position, target.position).normalize();
  bullet.position.addScaledVector(direction, 1); // Velocidade do tiro
}*/

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

export function setEditorGameLoop(callback) {
  editorGameLoopFunction = callback; // Define o callback do loop de jogo
}

export function setEditorGameStart(callback) {
  editorGameStartFunction = callback; // Define o callback do loop de jogo
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

export function getDelta() {
  return delta;
}

export function getClock() {
  return clock;
}

export function getDeltaTime() {
  return clock.getDelta();
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

 // PARTÍCULA (FUTURO PARTICLES SYSTEM)
export function createSmokeTrail(position, color) {
  const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
  const fire = new THREE.Mesh(fireGeometry, fireMaterial.clone());

  // Definir a posição inicial da fumaça e da chama como a posição do projétil
  smoke.position.copy(position);
  fire.position.copy(position);

  // Adicionar a fumaça e a chama à cena
  scene.add(smoke);
  scene.add(fire);

  // Definir a opacidade inicial
  smoke.material.opacity = 1; // Começar totalmente opaco
  fire.material.opacity = 1; // Começar totalmente opaco

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
  fire.material.opacity = 1; // Começar totalmente opaco
  const fireFadeInterval = setInterval(() => {
    fire.material.opacity -= 0.8; // Diminui a opacidade mais rápido que a fumaça
    if (fire.material.opacity <= 0) {
      clearInterval(fireFadeInterval); // Parar a redução de opacidade
      scene.remove(fire); // Remover a chama da cena
    }
  }, 20); // Atualiza a cada 20ms
}

export function createExplosion(position) {
  const explosionMaterial = new THREE.MeshPhongMaterial({
    map: fireTexture, // Textura
    emissive: new THREE.Color(0xffa500),
    emissiveIntensity: 0.8,
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
  scene.add(explosion);

  // Remover explosão após 0.5 segundos
  setTimeout(() => {
    console.log('remover explosão');
    scene.remove(explosion);
  }, 500);
}

export function loadTexture(name) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(fileSystem.texture + "/" + name);

  return texture;
}

export function cameraVector3(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

export class Environment {
  setHDR(path) {
      rgbeLoader.load(fileSystem.texture + '/' + path, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture; // Define o ambiente
          scene.background = texture;   // Define o fundo
      });
  }

  setSkybox(images) {
      const loader = new THREE.CubeTextureLoader();
      const skyTexture = loader.load(fileSystem.texture + '/' + images);
      scene.background = skyTexture; // Define o céu
  }

  addDirectionalLight(color = 0xffffff, intensity = 1, position = [5, 10, 7.5]) {
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(...position);
      light.castShadow = true;  // Habilitar sombreamento na luz

      // Tamanho do mapa de sombras para melhorar a qualidade
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      
      // Definir os limites da câmera da sombra
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 500;
      light.shadow.camera.left = -10;
      light.shadow.camera.right = 10;
      light.shadow.camera.top = 10;
      light.shadow.camera.bottom = -10;

      light.shadow.bias = -0.0001;  // Pequeno valor negativo para resolver problemas de precisão

      scene.add(light);
      return light;
  }

  addAmbientLight(color = 0x404040, intensity = 1) {
      const light = new THREE.AmbientLight(color, intensity);
      light.castShadow = true;
      // Ajustes para a sombra da luz
      light.shadow.mapSize.width = 1024; // Tamanho do mapa de sombras
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 0.5; // Distância mínima da sombra
      light.shadow.camera.far = 500;  // Distância máxima da sombra
      scene.add(light);
      return light;
  }

  addPointLight(color = 0xffffff, intensity = 1, distance = 100, position = [10, 10, 10]) {
      const light = new THREE.PointLight(color, intensity, distance);
      light.position.set(...position);
      light.castShadow = true; // Habilita sombras
      scene.add(light);
      return light;
  }

  addSpotLight(color = 0xffffff, intensity = 1, position = [15, 30, 15]) {
      const light = new THREE.SpotLight(color, intensity);
      light.position.set(...position);
      light.castShadow = true; // Habilita sombras
      scene.add(light);
      return light;
  }

  setFog(color = 0xffffff, density = 0.1) {
      scene.fog = new THREE.FogExp2(color, density);
  }
}

////////////////////// pos processing ////////////////////////

export class PostProcessing {
  addBloom(strength = 1, radius = 1, threshold = 0.1) {
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), strength, radius, threshold);
      composer.addPass(bloomPass);
  }

  addFilm(grain = 0.35, intensity = 0.5, scanlineIntensity = 0.75) {
      const filmPass = new FilmPass(grain, intensity, scanlineIntensity, false);
      composer.addPass(filmPass);
  }
/*
  addDepthOfField(focusDistance = 0.1, focalLength = 1.0, aperture = 0.01) {
      const dofPass = new DepthOfFieldPass(this.camera, {
          focusDistance: focusDistance,
          focalLength: focalLength,
          aperture: aperture,
      });
      composer.addPass(dofPass);
  }

  /*addMotionBlur(blurAmount = 0.5) {
      const motionBlurPass = new MotionBlurPass(blurAmount);
      composer.addPass(motionBlurPass);
  }*/

  addVignette(intensity = 0.5, radius = 0.5) {
      const vignettePass = new ShaderPass(VignetteShader);
      vignettePass.uniforms['intensity'].value = intensity;
      vignettePass.uniforms['radius'].value = radius;
      composer.addPass(vignettePass);
  }

  addTexture(texture) {
      const texturePass = new TexturePass(texture);
      composer.addPass(texturePass);
  }

  render() {
      composer.render();
  }
}

export function audioPlayer(path) {
  const sound = new THREE.Audio(listener);

  audioLoader.load(fileSystem.sounds + '/' + path, function(buffer) {
      sound.setBuffer(buffer);
      sound.setVolume(1);
  });

  return sound;
}

export class Geometry {
  createSphere(r, h, v, c) {
    let sphereGeometry = new THREE.SphereGeometry(r, h, v);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let sphere = new THREE.Mesh(sphereGeometry, material);

    return sphere;
  }

  createBox(width, height, depth, c) {
    let boxGeometry = new THREE.BoxGeometry(width, height, depth);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let box = new THREE.Mesh(boxGeometry, material);
    box.castShadow = true;
    box.receiveShadow = true;

    return box;
  }

  createCylinder(radiusTop, radiusBottom, height, radialSegments, c) {
    let cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let cylinder = new THREE.Mesh(cylinderGeometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  createCone(radius, height, radialSegments, c) {
    let coneGeometry = new THREE.ConeGeometry(radius, height, radialSegments);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let cone = new THREE.Mesh(coneGeometry, material);
    cone.castShadow = true;
    cone.receiveShadow = true;

    return cone;
  }

  createPlane(width, height, c) {
    let planeGeometry = new THREE.PlaneGeometry(width, height);
    let material = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
    let plane = new THREE.Mesh(planeGeometry, material);
    plane.castShadow = true;
    plane.receiveShadow = true;

    return plane;
  }

  createTorus(radius, tube, radialSegments, tubularSegments, c) {
    let torusGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let torus = new THREE.Mesh(torusGeometry, material);
    torus.castShadow = true;
    torus.receiveShadow = true;

    return torus;
  }

  createIcosahedron(radius, detail, c) {
    let icosahedronGeometry = new THREE.IcosahedronGeometry(radius, detail);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let icosahedron = new THREE.Mesh(icosahedronGeometry, material);

    return icosahedron;
  }

  createDodecahedron(radius, detail, c) {
    let dodecahedronGeometry = new THREE.DodecahedronGeometry(radius, detail);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let dodecahedron = new THREE.Mesh(dodecahedronGeometry, material);

    return dodecahedron;
  }

  createTetrahedron(radius, detail, c) {
    let tetrahedronGeometry = new THREE.TetrahedronGeometry(radius, detail);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let tetrahedron = new THREE.Mesh(tetrahedronGeometry, material);

    return tetrahedron;
  }

  createTorusKnot(radius, tube, tubularSegments, radialSegments, p, q, c) {
    let torusKnotGeometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let torusKnot = new THREE.Mesh(torusKnotGeometry, material);

    return torusKnot;
  }

  createRing(innerRadius, outerRadius, thetaSegments, phiSegments, c) {
    let ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments);
    let material = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
    let ring = new THREE.Mesh(ringGeometry, material);

    return ring;
  }

  createOctahedron(radius, detail, c) {
    let octahedronGeometry = new THREE.OctahedronGeometry(radius, detail);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let octahedron = new THREE.Mesh(octahedronGeometry, material);

    return octahedron;
  }

  createTube(path, tubularSegments, radius, radialSegments, closed, c) {
    let tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed);
    let material = new THREE.MeshBasicMaterial({ color: c });
    let tube = new THREE.Mesh(tubeGeometry, material);

    return tube;
  }
}

export class Physics {
  addSpherePhysics(object, radius, mass, position = null) {
    // Usar a posição do objeto Three.js se a posição não for fornecida
    const objPosition = position || [object.position.x, object.position.y, object.position.z];
    
    let sphereShape = new CANNON.Sphere(radius);
    let sphereBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...objPosition),
      shape: sphereShape
    });

    sphereBody.threeObject = object; // Associar o objeto Three.js ao corpo
    object.body = sphereBody; // Associar o corpo ao objeto Three.js
    world.addBody(object.body);
    return sphereBody;
  }

  addBoxPhysics(object, width, height, depth, mass, position = null) {
    // Usar a posição do objeto Three.js se a posição não for fornecida
    const objPosition = position || [object.position.x, object.position.y, object.position.z];

    let boxShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    let boxBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...objPosition),
      shape: boxShape
    });

    boxBody.threeObject = object; // Associar o objeto Three.js ao corpo

    object.body = boxBody; // Associar o corpo ao objeto Three.js
    world.addBody(object.body);
    return boxBody;
  }

  addCylinderPhysics(object, radiusTop, radiusBottom, height, mass, position = null) {
    // Usar a posição do objeto Three.js se a posição não for fornecida
    const objPosition = position || [object.position.x, object.position.y, object.position.z];

    let cylinderShape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
    let cylinderBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...objPosition),
      shape: cylinderShape
    });

    cylinderBody.threeObject = object; // Associar o objeto Three.js ao corpo

    object.body = cylinderBody; // Associar o corpo ao objeto Three.js
    world.addBody(object.body);
    return cylinderBody;
  }

  addPlanePhysics(object, mass, position = null) {
    // Usar a posição do objeto Three.js se a posição não for fornecida
    const objPosition = position || [object.position.x, object.position.y, object.position.z];

    let planeShape = new CANNON.Plane();
    let planeBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...objPosition),
      shape: planeShape
    });

    planeBody.threeObject = object; // Associar o objeto Three.js ao corpo

    object.body = planeBody; // Associar o corpo ao objeto Three.js
    world.addBody(object.body);
    return planeBody;
  }

  addCustomPhysics(object, shape, mass, position = null) {
    // Usar a posição do objeto Three.js se a posição não for fornecida
    const objPosition = position || [object.position.x, object.position.y, object.position.z];

    let customBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...objPosition),
      shape: shape
    });

    customBody.threeObject = object; // Associar o objeto Three.js ao corpo

    object.body = customBody; // Associar o corpo ao objeto Three.js
    world.addBody(object.body);
    return customBody;
  }
}

export class Animation {
  createAnimator(model) {
   const animator = new THREE.AnimationMixer(model.gameObject);
   model.animator = animator;

   return animator;
 }

 playAnimation(animator, animation) {
   if (animation) {
     const action = animator.clipAction(animation);
     action.play();  // Toca a primeira animação
   }
 }
}

////////////////////editor////////////////////

let controls;
export function getEditorCamera() {
  /*editorCamera.position.set(0, 0, 5);
  controls = new OrbitControls(editorCamera, editorCanvas);
  controls.enableDamping = true; // Efeito de amortecimento
  */
  return controls;
}

let raycaster, mouse;

export function transformControl() {
  return transformControls;
}

let attachObject;
export function setAttach(gameObject) {
  attachObject = gameObject;
  transformControls.attach(gameObject); // Anexa o pai
  gizmo.visible = true; // Torna o gizmo visível
  controls.enabled = false; 
}

/*
window.addEventListener('click', (event) => {
  if (transformControls) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true); // O segundo parâmetro verifica filhos

      
      if (intersects.length > 0) {
          const selectedObject = intersects[0].object;
          let objectToAttach = selectedObject;

          // Se o objeto selecionado for uma Mesh, pegue seu pai
          if (selectedObject instanceof THREE.Mesh) {
              objectToAttach = selectedObject.parent; // Pega o pai
              console.log(objectToAttach);
          }

          // Verifica se o objeto pai é um Group ou Mesh
          if (objectToAttach instanceof THREE.Group) {
              transformControls.attach(objectToAttach); // Anexa o pai
              gizmo.visible = true; // Torna o gizmo visível
              controls.enabled = false; 
          }
      } else {
          transformControls.detach();
          gizmo.visible = false; // Esconde o gizmo
          controls.enabled = true; 
      }
  }
});*/


window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
      attachObject = null;
      transformControls.detach(); // Desanexa o objeto
      gizmo.visible = false; // Esconde o gizmo
      controls.enabled = true; // Reativa os controles de orbit
  }
});

export function returnSceneObjectsList() {

  return sceneObjects;
}

