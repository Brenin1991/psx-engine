const fileSystem = {
  models: "models",
  sounds: "sounds",
  texture: "textures",
  scripts: "scripts",
};
let scene, 
  canvas,
  camera,
  renderer,renderPass,
  composer,
  airplane,
  bullets = [],
  explosions = [];
let floor;
let speed = 0.4,
  bulletSpeed = 2;
let maxX = 25,
  maxY = 40,
  minX = -25,
  minY = 1; // Limites do avião
let rollAngle = 0.2; // Ângulo máximo de inclinação ao mover
let rollVertical = 0.2,
  maxAngle = 1,
  minAngle = -1;
let score = 0; // Para contar a pontuação

// Variável para armazenar o modelo do avião inimigo
let enemyAirplane, enemyTank, enemyHelicopter, missile;
let heli = [];
let enemies = [];
const enemySpeed = {
  airplane: 1,
  tank: 0.4,
  helicopter: 0.5,
};

let skyLoader, skyboxTexture;

const globalColor = 0xf7f6f6;
const lightColor = 0xffe0ad;
const ambientColor = 0xdddad4;

const light = new THREE.DirectionalLight(globalColor, 1);
light.position.set(5, 5, 5);
const lightDirection = new THREE.Vector3();
light.getWorldDirection(lightDirection);

const lightColorValue = new THREE.Color(lightColor);
const ambientLightColorValue = new THREE.Color(ambientColor); // Cor inicial da luz ambiente

const smokeTexture = loadTexture("smoke.png");
const fireTexture = loadTexture("explosion.png");

const smokeGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const fireGeometry = new THREE.SphereGeometry(0.5, 8, 8);

const clock = new THREE.Clock();
const targetFPS = 60;
const interval = 1000 / targetFPS; // Intervalo em milissegundos
let lastRender = 0;
let frameCount = 0;
let lastTime = 0;
let fps = 0;

let psxShaderMaterial;

let timeMulti = 2;

let effectsEnabled = true;

let pixelShader,
  interlaceShader,
  depthOfFieldShader,
  limitedColorPaletteShader,
  ditherShader,
  chromaticAberrationShader,
  noiseShader,
  curvatureShader;

let pixelPass,
  interlacePass,
  depthOfFieldPass,
  limitedColorPalettePass,
  ditherPass,
  chromaticAberrationPass,
  noisePass,
  curvaturePass;

const modelLoader = new THREE.GLTFLoader();

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

let vertexShader, fragmentShader;

// Lista para armazenar todos os tiros dos inimigos
let enemyBullets = [];

function init() {
  
  setUpRenderer();
  setUpPostProcessing()
  loadFilters();
  setUpFilters();
  instantiate(light);
  setUpEnvironment();
  loadShaders();
  setUpAudio();
  loadModels();
  setEnemyShooting();
  spawnEnemies();
  startGame();

  // Movimentação e disparo
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Limitar a taxa de FPS
  if (lastRender + interval < elapsedTime * 1000) {
    lastRender = elapsedTime * 1000; // Atualiza o tempo do último render

    frameCount++;

    if (elapsedTime - lastTime >= 1) {
      fps = frameCount; // Armazena o número de frames em um segundo
      frameCount = 0; // Reseta o contador
      lastTime = elapsedTime; // Atualiza o último tempo
      console.log(`FPS: ${fps}`); // Exibe FPS no console
      document.getElementById("fps-count").innerText = `FPS: ${fps}`;
    }

    if (pixelShader.uniforms.time) {
      pixelShader.uniforms.time.value = clock.getElapsedTime();
    }
    if (airplane) {
      playerInput();
      moveEnemyBullets();
      moveFloor();
      moveEnemies();
      moveBullets();
      UpdateShaders();
      playerCamera();    
      scoreManager();
    }
    // Renderizar cena com efeito de pós-processamento
    composer.render();
  }
}

function setUpEnvironment() {
  scene.fog = new THREE.Fog(globalColor, 100, 300); // Cor do fog, distância inicial, distância máxima
  scene.background = new THREE.Color(0xff3c12); // Cor em hexadecimal

  skyLoader = new THREE.CubeTextureLoader();
  skyboxTexture = skyLoader.load([
    "sky/bluecloud_rt.jpg", // direita
    "sky/bluecloud_lf.jpg", // esquerda
    "sky/bluecloud_up.jpg", // cima
    "sky/bluecloud_dn.jpg", // baixo
    "sky/bluecloud_ft.jpg", // frente
    "sky/bluecloud_bk.jpg", // trás
  ]);

  // (Descomente a linha abaixo se você quiser usar o skybox)
  scene.background = skyboxTexture; // Isso irá sobrepor a cor de fundo
}

function setUpPostProcessing() {
  // Composer para efeitos de pós-processamento
  composer = new THREE.EffectComposer(renderer);
  renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
}

function setUpRenderer() {
  // Cena
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 640 / 480, 0.1, 300);
  camera.position.z = 7;
  camera.position.y = 3;

  canvas = document.getElementById("gameCanvas");
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // Suaviza as bordas dos objetos
    stencil: false,
    depth: false,
    powerPreference: "high-performance", // Melhor desempenho gráfico
    alpha: true, // Se necessário para transparência do fundo
    precision: "highp", // Alta precisão nos shaders
    physicallyCorrectLights: true,
    outputEncoding: THREE.GammaEncoding,
    logarithmicDepthBuffer: false,
  });

  renderer.setSize(640, 480); // Força a resolução de 640x480
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Um dos melhores para cores vibrantes
  renderer.toneMappingExposure = 2; // Aumente para um efeito de brilho arcade, ajuste conforme necessário
}

// Função para fazer os inimigos atirarem
function enemyShoot(enemy) {
  const bullet = missile.clone();

  // A posição inicial do tiro será a posição do inimigo
  bullet.position.copy(enemy.enemy.position);

  const direction = new THREE.Vector3();
  direction.subVectors(airplane.position, enemy.enemy.position).normalize(); // Direção do tiro no momento do disparo

  bullet.lookAt(airplane.position);
  // Adicionar bala à cena e à lista de projéteis
  instantiate(bullet);
  const bulletData = { bullet: bullet, target: direction };
  enemyBullets.push(bulletData);

  const enemyShotSound = document.getElementById("enemyShotSound");
  enemyShotSound.currentTime = 0;
  enemyShotSound.volume = 0.3;
  enemyShotSound.play();

  // Destruir a bala após 5 segundos
  setTimeout(() => {
    // Verifica se a bala ainda existe no array antes de removê-la
    const index = enemyBullets.indexOf(bulletData);
    if (index > -1) {
      scene.remove(bullet); // Remove a bala da cena
      enemyBullets.splice(index, 1); // Remove a bala da lista
    }
  }, 5000); // 5000 milissegundos = 5 segundos
}

// Função para mover os tiros inimigos em direção ao jogador
function moveEnemyBullets() {
  /* enemyBullets.forEach((bulletData, index) => {
  const bullet = bulletData.bullet;
  const direction = new THREE.Vector3();

  // Calcular direção do inimigo para o jogador
  direction.subVectors(bulletData.target, bullet.position).normalize();
  bullet.position.addScaledVector(direction, 1); // Velocidade do tiro

  // Verificar colisão com o avião do jogador
  if (bullet.position.distanceTo(airplane.position) < 1) {
    // Causar dano ou finalizar o jogo
    createExplosion(airplane.position);
    endGame();
    scene.remove(bullet);
    enemyBullets.splice(index, 1);
  }

  // Remover o tiro se sair da área de jogo
  if (bullet.position.z > airplane.position.z + 20 || bullet.position.z < airplane.position.z - 100) {
    scene.remove(bullet);
    enemyBullets.splice(index, 1);
  }
});*/
  enemyBullets.forEach((bulletData, index) => {
    const bullet = bulletData.bullet;
    const direction = bulletData.target; // Usar a direção calculada no momento do disparo

    translateTo(bullet, direction, 2);
    createSmokeTrail(bullet.position, "0x888888");
    // Verificar colisão com o avião do jogador
    if (bullet.position.distanceTo(airplane.position) < 2) {
      // Causar dano ou finalizar o jogo
      //createExplosion(airplane.position);
      // endGame();
      scene.remove(bullet);
      enemyBullets.splice(index, 1);
    }

    // Remover o projétil se sair da área de jogo
    if (
      bullet.position.z > airplane.position.z + 20 ||
      bullet.position.z < airplane.position.z - 100
    ) {
      scene.remove(bullet);
      enemyBullets.splice(index, 1);
    }
  });
}

function setEnemyShooting() {
  // Avião inimigo atira a cada 2 segundos
  /* setInterval(() => {
  planes.forEach((plane) => {
    enemyShoot(plane);
  });
}, 5000);*/

  // Tanques inimigos atiram a cada 3 segundos
  setInterval(() => {
    enemies.forEach((enemy) => {
      enemyShoot(enemy);
    });
  }, 3000);
}

function setUpAudio() {
  const engineSFX = document.getElementById("engineSound");
  engineSFX.loop = true; // Define o som para tocar em loop
  engineSFX.play();
  engineSFX.volume = 0.3; // Aumentar o volume
  const themeSFX = document.getElementById("themeSound");
  themeSFX.loop = true; // Define o som para tocar em loop
  themeSFX.play();
  themeSFX.volume = 0.5; // Aumentar o volume
}

function spawnEnemies() {
  setInterval(function () {
    createEnemies(2, "tank", 0.4); // Exemplo: criar 5 inimigos a cada 3 segundos
  }, 5000);

  setInterval(function () {
    createEnemies(3, "helicopter", 1); // Exemplo: criar 5 inimigos a cada 3 segundos
  }, 8000);
}

function loadModels() {
  LoadModelGLB(
    "f16",
    new THREE.Vector3(0.01, 0.01, 0.01),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, Math.PI, 0),
    function (model) {
      if (model) {
        airplane = model;
        instantiate(airplane);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );

  LoadModelGLB(
    "tank",
    new THREE.Vector3(4, 4, 4),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    function (model) {
      if (model) {
        enemyTank = model;
        //scene.add(enemyTank);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );

  LoadModelGLB(
    "helicopter",
    new THREE.Vector3(0.01, 0.01, 0.01),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    function (model) {
      if (model) {
        enemyHelicopter = model;
        //scene.add(enemyHelicopter);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );

  LoadModelGLB(
    "missile2",
    new THREE.Vector3(0.02, 0.02, 0.02),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    function (model) {
      if (model) {
        missile = model;
        //scene.add(enemyHelicopter);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );

  LoadModelGLB(
    "f16",
    new THREE.Vector3(0.01, 0.01, 0.01),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    function (model) {
      if (model) {
        enemyAirplane = model;
        //scene.add(enemyHelicopter);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );

  LoadModelGLB(
    "01",
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    function (model) {
      if (model) {
        floor = model;
        instantiate(floor);
        console.log("Modelo adicionado à cena");
      } else {
        console.error("O modelo retornado é inválido.");
      }
    }
  );
}

function createEnemies(numEnemies, type, velocity) {
  // Verificar o número atual de inimigos
  const currentEnemiesCount = enemies.length;
  const maxEnemiesCount = 10; // Limite máximo de inimigos

  // Calcular quantos novos inimigos podem ser criados
  const enemiesToCreate = Math.min(
    numEnemies,
    maxEnemiesCount - currentEnemiesCount
  );

  for (let i = 0; i < enemiesToCreate; i++) {
    let enemy;

    if (type == "plane") {
      enemy = enemyAirplane.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        2 + Math.random() * (30 - 1) + 2, // Posição Y levemente aleatória ao redor da altura do avião
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else if (type == "tank") {
      enemy = enemyTank.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        0, // Posição Y levemente aleatória ao redor da altura do tanque
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else if (type == "helicopter") {
      enemy = enemyHelicopter.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        2 + Math.random() * (30 - 1) + 2, // Posição Y levemente aleatória ao redor da altura do helicóptero
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    } else {
      enemy = enemyTank.clone(); // Clonar o inimigo original para evitar reutilizar o mesmo objeto
      enemy.position.set(
        -20 + Math.random() * (30 - 2),
        0, // Posição Y levemente aleatória ao redor da altura do tanque
        -200 + Math.random() * 20 // Posição Z inicial um pouco variada
      );
    }

    enemy.traverse(function (child) {
      if (child.isMesh) {
        const originalMaterial = child.material;
        if (originalMaterial.map) {
          // Clonar o psxShaderMaterial para o tanque
          const tankMaterial = psxShaderMaterial.clone();
          tankMaterial.uniforms.uTexture.value = originalMaterial.map; // Adicionar a textura original do tanque

          // Substituir o material pelo novo tankMaterial
          child.material = tankMaterial;
        }
      }
    });

    enemies.push({ enemy: enemy, type: type, velocity: velocity });
    instantiate(enemy);
  }
}

let keys = {};
function onKeyDown(event) {
  keys[event.key] = true;
}

function onKeyUp(event) {
  keys[event.key] = false;
}

function shoot() {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  // Posicione a bala na posição do avião
  bullet.position.copy(airplane.position);

  // Calcular a direção da bala com base na rotação do avião
  const bulletDirection = new THREE.Vector3(0, 0, 1); // A bala é disparada para frente
  bulletDirection.applyQuaternion(airplane.quaternion); // Ajusta a direção com a rotação do avião

  // Adicionar a bala à cena e ao array de projéteis
  instantiate(bullet);
  bullets.push({ mesh: bullet, direction: bulletDirection });

  // Tocar o som do disparo
  const shotSound = document.getElementById("shotSound");
  shotSound.currentTime = 0;
  shotSound.volume = 0.5;
  shotSound.play();
}

function handleKeyboardInput() {
  if (keys["ArrowLeft"] && airplane.position.x > minX) {
    airplane.position.x -= speed;
    airplane.rotation.z = -rollAngle;
  }
  if (keys["ArrowRight"] && airplane.position.x < maxX) {
    airplane.position.x += speed;
    airplane.rotation.z = rollAngle;
  }
  if (keys["ArrowUp"]) {
    if (airplane.position.y < maxY) {
      airplane.position.y += speed;
      airplane.rotation.y = rollVertical;
    }
  }
  if (keys["ArrowDown"]) {
    if (airplane.position.y > minY) {
      airplane.position.y -= speed;
      airplane.rotation.y = -rollVertical;
    }
  }
  if (keys["Space"]) {
    shoot();
  } else {
    airplane.rotation.z = 0;
  }
}

function handleGamepadInput() {
  if (airplane) {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      const gp = gamepads[0];

      if (gp.buttons[2].pressed) {
        toggleCrtFX();
      }

      // Eixo horizontal
      if (gp.axes[0] < -0.5) {
        if (airplane.position.x > minX) {
          translate(airplane.position, "x", -speed);
        }

        if (airplane.rotation.z < 1) {
          targetRoll = -rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (gp.axes[0] > 0.5) {
        if (airplane.position.x < maxX) {
          translate(airplane.position, "x", speed);
        }

        if (airplane.rotation.z > -1) {
          targetRoll = rollAngle / 2; // Defina a rotação alvo
        }
      }
      if (Math.abs(gp.axes[0]) > -0.5 && Math.abs(gp.axes[0]) < 0.5) {
        targetRoll = 0; // Resetar a rotação alvo se não houver entrada
      }

      // Suavizar a rotação em z
      airplane.rotation.z = THREE.MathUtils.lerp(
        airplane.rotation.z,
        targetRoll * 5,
        0.1
      );

      // Eixo vertical
      if (gp.axes[1] > 0.5) {
        if (airplane.position.y < maxY) {
          translate(airplane.position, "y", speed / 2);
          if (airplane.rotation.x < maxAngle) {
            targetPitch = rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (gp.axes[1] < -0.5) {
        if (airplane.position.y > minY) {
          translate(airplane.position, "y", -(speed / 2));
          if (airplane.rotation.x > minAngle) {
            targetPitch = -rollVertical; // Defina a rotação alvo
          }
        }
      }
      if (Math.abs(gp.axes[1]) < 0.5) {
        targetPitch = 0; // Resetar a rotação alvo se não houver entrada
      }

      // Suavizar a rotação em x
      airplane.rotation.x = THREE.MathUtils.lerp(
        airplane.rotation.x,
        targetPitch,
        0.1
      );

      // Botão de disparo (botão A do controle Xbox)
      if (gp.buttons[0].pressed) {
        shoot();
      }
    }
  }
}

function scoreManager() {
  // Atualizar score
  document.getElementById("finalScore").innerText = "Score: " + score;  
}

function UpdateShaders() {
  scene.traverse(function (object) {
    if (object.material) {
      // Verifique se o material tem o uniforme `time`
      if (object.material.uniforms && object.material.uniforms.time) {
        object.material.uniforms.time.value = clock.getElapsedTime();
      }
    }
  });
}

function playerCamera() {
  // Fixar câmera no avião com suavidade (usando "lerp")
  const desiredCameraPosition = new THREE.Vector3(
    airplane.position.x,
    airplane.position.y + 2.5,
    airplane.position.z + 9
  );
  const look = new THREE.Vector3(
    airplane.position.x,
    airplane.position.y + 3,
    airplane.position.z
  );
  camera.position.lerp(desiredCameraPosition, 0.4); // Lerp para suavidade
  camera.lookAt(look);
}

function playerInput() {
  // Movimentação do avião
  //handleKeyboardInput();
  handleGamepadInput();
  // Atirar
  if (keys[" "]) shoot();
}

function moveFloor() {
  if (floor) {
    translate(floor.position, "z", speed);
    if (floor.position.z > 500) floor.position.z = 0;
  }
}

function moveBullets() {
  // Atualizar projéteis
  bullets.forEach((bulletObj, index) => {
    const bullet = bulletObj.mesh;
    const direction = bulletObj.direction;

    translateTo(bullet, direction, bulletSpeed);

    // Verificar colisões com inimigos
    enemies.forEach((enemy, enemyIndex) => {
      // Verificar colisão
      if (bullet.position.distanceTo(enemy.enemy.position) < 4) {
        createExplosion(enemy.enemy.position);
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gamepad = gamepads[i];
          if (gamepad && gamepad.vibrationActuator) {
            // Se houver suporte para vibração, ative
            gamepad.vibrationActuator.playEffect("dual-rumble", {
              startDelay: 0,
              duration: 500, // Duração da vibração em milissegundos
              weakMagnitude: 1.0, // Intensidade da vibração leve
              strongMagnitude: 1.0, // Intensidade da vibração forte
            });
          }
        }

        // Remove a classe shake após a animação
        setTimeout(() => {
          document.querySelector(".effect-container").classList.remove("shake");
        }, 300); // Tempo igual ao da animação

        // Remover projétil e inimigo

        bullets.splice(index, 1);

        enemies.splice(enemyIndex, 1);
        scene.remove(bullet);
        scene.remove(enemy.enemy);
      }
    });
  });
}

function moveEnemies() {
  // Atualizar inimigos
  enemies.forEach((enemy, index) => {
    translate(enemy.enemy.position, "z", enemy.velocity);
    if (
      enemy.enemy.position.distanceTo(airplane.position) > 30 &&
      enemy.type != "tank"
    ) {
      enemy.enemy.lookAt(airplane.position); // Fazer o inimigo olhar para o avião
    } else {
      // Se a distância for menor ou igual a 5, o inimigo não seguirá mais o avião
      // Você pode deixá-lo seguir em linha reta ou congelar a rotação dele
      // Aqui, ele para de olhar o avião, mantendo a última direção
    }
    // enemy.lookAt(null);
    // Verificar se colidiu com o avião
    if (enemy.enemy.position.distanceTo(airplane.position) < 2) {
      // Criar explosão e finalizar jogo
      createExplosion(enemy.enemy.position);
      endGame();
    }

    // Remover inimigo se sair da tela (se passar do jogador)
    if (enemy.enemy.position.z > airplane.position.z + 10) {
      scene.remove(enemy.enemy);
      enemies.splice(index, 1);
    }
  });
}

function createExplosion(position) {
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
  explosions.push(explosion);
  instantiate(explosion);

  // Tocar som de explosão
  const explosionSound = document.getElementById("explosionSound");
  explosionSound.currentTime = 0;
  explosionSound.play();

  // Remover explosão após 0.5 segundos
  setTimeout(() => {
    scene.remove(explosion);
    explosions.splice(explosions.indexOf(explosion), 1);
  }, 500);
}

function endGame() {
  document.getElementById("gameScreen").classList.remove("visible"); // Esconder tela de início
  document.getElementById("gameOverScreen").classList.add("visible"); // Esconder tela de game over
  resetGame();
}

function startGame() {
  document.getElementById("gameScreen").classList.add("visible");
}

function resetGame() {
  // Resetar variáveis e cenários para reiniciar o jogo
  score = 0;
  bullets.forEach((bullet) => scene.remove(bullet));
  enemies.forEach((enemy) => scene.remove(enemy));
  bullets = [];
  enemies = [];
}

// Iniciar o jogo
init();


/////////////////////////////////////////ENGINE///////////////////////////////////////////////////////
function loadTexture(name) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(fileSystem.texture + "/" + name);

  return texture;
}

// Função LoadModelGLB com callback
function LoadModelGLB(name, scale, position, rotation, callback) {
  modelLoader.load(
    // Caminho do modelo
    fileSystem.models + "/" + name + ".glb",

    // Função de sucesso
    function (gltf) {
      const model = gltf.scene;

      // Verificar se o modelo existe e é uma instância de THREE.Object3D
      if (model instanceof THREE.Object3D) {
        model.scale.set(scale.x, scale.y, scale.z);
        model.position.set(position.x, position.y, position.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);
        model.traverse(function (child) {
          if (child.isMesh) {
            const originalMaterial = child.material;
            if (originalMaterial.map) {
              const material = psxShaderMaterial.clone();
              material.uniforms.uTexture.value = originalMaterial.map;
              child.material = material;
            }
          }
        });

        console.log("Modelo carregado com sucesso:", model);

        // Chame o callback se for válido
        if (callback) callback(model);
      } else {
        console.error(
          "Erro: O modelo carregado não é uma instância de THREE.Object3D."
        );
      }
    },

    // Função de progresso opcional
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% carregado");
    },

    // Função de erro
    function (error) {
      console.error("Erro ao carregar o modelo:", error);
    }
  );
}

function instantiate(model) {
  scene.add(model);
}

function translate(object, axis, value) {
  if (value >= 0) {
    object[axis] += value * timeMulti; // Adiciona se for positivo ou zero
  } else {
    object[axis] += value * timeMulti; // Subtrai automaticamente se for negativo
  }
}

function translateTo(model, target, velocity) {
  model.position.addScaledVector(target, velocity * timeMulti);
}

function toggleCrtFX() {
  if (effectsEnabled) {
    // Remove todos os passes
    composer.passes = composer.passes.filter(
      (pass) => ![interlacePass, curvaturePass].includes(pass)
    );
    document.getElementById("crt-lines-1").classList.remove("vhs-lines"); // Esconder tela de início
    document.getElementById("crt-lines-2").classList.remove("crt-lines"); // Esconder tela de game over
    document.getElementById("vidro").classList.remove("vidro"); // Esconder tela de game over
    document.getElementById("image-test").classList.remove("pixelated"); // Esconder tela de game over
    document
      .getElementById("effect-container")
      .classList.remove("border-light"); // Esconder tela de game over
  } else {
    // Adiciona todos os passes novamente
    //composer.addPass(limitedColorPalettePass);
    //composer.addPass(pixelPass);
    composer.addPass(interlacePass);
    composer.addPass(curvaturePass);
    document.getElementById("crt-lines-1").classList.add("vhs-lines"); // Esconder tela de início
    document.getElementById("crt-lines-2").classList.add("crt-lines"); // Esconder tela de game over
    document.getElementById("vidro").classList.add("vidro"); // Esconder tela de game over
    document.getElementById("image-test").classList.add("pixelated"); // Esconder tela de game over
    document.getElementById("effect-container").classList.add("border-light"); // Esconder tela de game over
  }
  effectsEnabled = !effectsEnabled; // Alterna o estado
}

function loadFilters() {
    // Shader de Pixelização
    pixelShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: {
          value: new THREE.Vector2(640, 480),
        },
        pixelSize: { value: 1.2 },
        time: { value: 0.0 }, // Adicionar uniforme de tempo
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  
  // Simular imprecisão no modelo de vértice (distorção estilo PS1)
  vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  pos.xy += sin(pos.xy * 10.0) * 0.005; // Aumenta o fator para mais distorção
  gl_Position = pos;
  }
  `,
  
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform float pixelSize;
  uniform vec2 resolution;
  uniform float time; // Receber o tempo como uniforme
  varying vec2 vUv;
  
  void main() {
  vec2 dxy = pixelSize / resolution;
  
  // Simular imprecisão nas coordenadas UV (distorção estilo PS1)
  vec2 coord = dxy * floor(vUv / dxy);
  
  // Distorção dinâmica baseada no tempo
  coord += sin(coord * 10.0 + time) * 0.005; // Distorção das UVs com o tempo
  
  gl_FragColor = texture2D(tDiffuse, coord);
  }
  `,
    };
  
    interlaceShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(640, 480) },
        time: { value: 0.0 },
        scanlineIntensity: { value: 0.05 },
        lineCount: { value: 240.0 },
        pixelOffset: { value: 2.0 }, // Deslocamento para simular a separação dos pixels
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float time;
  uniform float scanlineIntensity;
  uniform float lineCount;
  uniform float pixelOffset;
  varying vec2 vUv;
  
  void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Simular scanlines interlace
  float scanline = sin(vUv.y * lineCount + time * 60.0) * 0.5 + 0.5;
  float lineEffect = mix(1.0, scanline, scanlineIntensity);
  
  // Aplicar o efeito de interlace
  color.rgb *= lineEffect;
  
  // Deslocar os canais RGB para simular a separação dos pixels
  vec4 rColor = texture2D(tDiffuse, vUv + vec2(-pixelOffset / resolution.x, 0.0));
  vec4 gColor = texture2D(tDiffuse, vUv);
  vec4 bColor = texture2D(tDiffuse, vUv + vec2(pixelOffset / resolution.x, 0.0));
  
  // Combinar os canais com o efeito
  gl_FragColor = vec4(rColor.r, gColor.g, bColor.b, color.a) * lineEffect;
  }
  `,
    };
  
    depthOfFieldShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(640, 480) },
        focusDistance: { value: 0.5 }, // Distância de foco
        blurAmount: { value: 0.02 }, // Quantidade de desfoque
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float focusDistance;
  uniform float blurAmount;
  varying vec2 vUv;
  
  void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Calcular o desfoque baseado na distância do centro da tela (foco simples)
  float dist = length(vUv - vec2(0.5, 0.5));
  float blur = smoothstep(focusDistance - blurAmount, focusDistance + blurAmount, dist);
  
  // Aplicar o desfoque à cor
  vec4 blurredColor = texture2D(tDiffuse, vUv + blur * 0.01);
  gl_FragColor = mix(color, blurredColor, blur);
  }
  `,
    };
  
    limitedColorPaletteShader = {
      uniforms: {
        tDiffuse: { value: null },
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  
  void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Limitar a paleta de cores a 16 valores por canal
  color.rgb = floor(color.rgb * 32.0) / 32.0;
  
  gl_FragColor = color;
  }
  `,
    };
  
    ditherShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(640, 480) },
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  float dither(vec2 uv) {
  vec2 ditherScale = resolution.xy / 2.0;
  vec2 pos = floor(uv * ditherScale);
  float pattern = mod(pos.x + pos.y, 2.0);
  return pattern * 0.1; // Valor de dithering
  }
  
  void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  color.rgb = floor(color.rgb * 4.0) / 4.0; // Reduz a paleta de cores
  color.rgb += dither(vUv); // Aplicar dithering
  gl_FragColor = color;
  }
  `,
    };
  
    chromaticAberrationShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(640, 480) },
        intensity: { value: 0.02 }, // Intensidade da aberração
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float intensity;
  varying vec2 vUv;
  
  void main() {
  vec4 color;
  vec2 offset = intensity * (vUv - 0.5) * resolution;
  
  // Simular a separação de cores (RGB)
  color.r = texture2D(tDiffuse, vUv + vec2(offset.x, 0.0)).r;
  color.g = texture2D(tDiffuse, vUv).g;
  color.b = texture2D(tDiffuse, vUv - vec2(offset.x, 0.0)).b;
  
  gl_FragColor = color;
  }
  `,
    };
  
    noiseShader = {
      uniforms: {
        tDiffuse: { value: null },
        noiseIntensity: { value: 0.05 },
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform float noiseIntensity;
  varying vec2 vUv;
  
  float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Adicionar ruído
  float noise = random(vUv) * noiseIntensity;
  color.rgb += noise;
  
  gl_FragColor = color;
  }
  `,
    };
  
    curvatureShader = {
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(640, 480) },
        curvatureAmount: { value: 0.01 }, // Intensidade da curvatura
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
      fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float curvatureAmount;
  varying vec2 vUv;
  
  void main() {
  vec2 uv = vUv;
  
  // Calcular a distorção da curvatura
  float dist = length(uv - 0.5) * curvatureAmount;
  uv.x += dist * (uv.y - 0.5); // Distorcer horizontalmente
  uv.y += dist * (uv.x - 0.5); // Distorcer verticalmente
  
  // Garantir que as coordenadas estejam dentro do intervalo [0, 1]
  uv = clamp(uv, 0.0, 1.0);
  
  vec4 color = texture2D(tDiffuse, uv);
  gl_FragColor = color;
  }
  `,
    };
}

function loadShaders() {
  vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float time;

void main() {
  vUv = uv;

  // Simulando o jitter nos vértices (baixa precisão de ponto flutuante)
  vec3 jitteredPosition = position;
  jitteredPosition.xy = floor(jitteredPosition.xy * 10.0) / 10.0; // Simula a imprecisão do PS1
  
  // Adicionar uma pequena distorção nos vértices para o efeito whoob, mantendo o jitter
  jitteredPosition.x += sin(position.y * 10.0 + time * 500.0) * 0.008; // Distort eixo X
  jitteredPosition.y += cos(position.x * 10.0 + time * 500.0) * 0.008; // Distort eixo Y

  vPosition = (modelViewMatrix * vec4(jitteredPosition, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  
  // Posicionar os vértices
  gl_Position = projectionMatrix * modelViewMatrix * vec4(jitteredPosition, 1.0);
}
`;

fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Uniforms do fog
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

// Uniform para iluminação difusa
uniform vec3 lightDirection;
uniform vec3 lightColor;

// Uniform para luz ambiente
uniform vec3 ambientLightColor;

uniform float time;

// Uniforms para o dithering
uniform float uColorDepth;  // Quantidade de cores (exemplo: 16 ou 32)

// Padrão de dithering 4x4
const float dither[16] = float[16](
  0.0,  8.0,  2.0, 10.0,
  12.0, 4.0, 14.0,  6.0,
  3.0, 11.0,  1.0,  9.0,
  15.0, 7.0, 13.0,  5.0
);

void main() {
  // Distorção dos UVs (simula imprecisão de textura em jogos antigos)
  vec2 distortedUV = vUv;
  distortedUV = floor(distortedUV * 128.0) / 128.0; // Simula baixa resolução de textura

  // Simulação de "texture warping" com base no tempo
  distortedUV.x += sin(vUv.y * 8.0 + time * 5.0) * 0.005;
  distortedUV.y += cos(vUv.x * 8.0 + time * 5.0) * 0.005;

  vec4 texColor = texture2D(uTexture, distortedUV);

  // Cálculo do fog (para simular o efeito de névoa usado no PS1)
  float distanceToCamera = length(vPosition);
  float fogFactor = smoothstep(fogNear * 0.6, fogFar, distanceToCamera);

  // Iluminação simplificada (no estilo flat)
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(lightDirection);
  float diffuse = max(dot(normal, lightDir), 0.3); // Força uma base de iluminação

  vec3 lighting = lightColor * diffuse;
  lighting += ambientLightColor;

  vec4 finalColor = vec4(texColor.rgb * lighting, texColor.a);

  // Determinar posição na matriz de dithering
  int x = int(mod(gl_FragCoord.x, 4.0));
  int y = int(mod(gl_FragCoord.y, 4.0));
  int index = x + y * 4;

  // Aplicar dithering para cada canal de cor separadamente
  float threshold = dither[index] / 16.0;
  vec3 ditheredColor = floor(finalColor.rgb * uColorDepth + threshold) / uColorDepth;

  // Combinar a cor dithered com o fog
  vec4 colorWithDither = vec4(ditheredColor, finalColor.a);
  gl_FragColor = mix(colorWithDither, vec4(fogColor, 1.0), fogFactor);
}
`;
  psxShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null }, // Textura será atualizada para cada objeto
      uColorDepth: { value: 16.0 }, // Define a profundidade de cor (8 níveis, por exemplo)
      fogColor: { value: scene.fog.color },
      fogNear: { value: scene.fog.near },
      fogFar: { value: scene.fog.far },
      lightDirection: { value: lightDirection }, // Direção da luz
      lightColor: { value: lightColorValue }, // Cor da luz direcional
      ambientLightColor: { value: ambientLightColorValue }, // Cor da luz ambiente
      time: { value: 1.0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    fog: true, // Habilitar fog no ShaderMaterial
    flatShading: true, // Shading plano, sem suavização
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "q") {
    toggleCrtFX();
  }
});

//PARTICULAS (FUTURO PARTICLES SYSTEM)
function createSmokeTrail(position, color) {
  const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
  const fire = new THREE.Mesh(fireGeometry, fireMaterial.clone());

  // Definir a posição inicial da fumaça e da chama como a posição do projétil
  smoke.position.copy(position);
  fire.position.copy(position);

  // Adicionar a fumaça e a chama à cena
  instantiate(smoke);
  instantiate(fire);

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

function setUpFilters() {
  pixelPass = new THREE.ShaderPass(pixelShader);
  interlacePass = new THREE.ShaderPass(interlaceShader);
  interlacePass.uniforms.time.value = 0.0; // Inicializa o tempo
  depthOfFieldPass = new THREE.ShaderPass(depthOfFieldShader);
  limitedColorPalettePass = new THREE.ShaderPass(limitedColorPaletteShader);
  ditherPass = new THREE.ShaderPass(ditherShader);
  chromaticAberrationPass = new THREE.ShaderPass(chromaticAberrationShader);
  noisePass = new THREE.ShaderPass(noiseShader);
  curvaturePass = new THREE.ShaderPass(curvatureShader);
  //composer.addPass(depthOfFieldPass);
  //composer.addPass(ditherPass);
  //composer.addPass(chromaticAberrationPass);
  //composer.addPass(noisePass);
  composer.addPass(limitedColorPalettePass);
  composer.addPass(pixelPass);
  composer.addPass(interlacePass);
  composer.addPass(curvaturePass);
}