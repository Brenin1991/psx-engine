//models
let airplane, enemyTank, enemyHelicopter, missile, enemyAirplane, floor;

let  bullets = [], explosions = [];
let speed = 0.4, bulletSpeed = 2;
let maxX = 25, maxY = 40, minX = -25, minY = 1;
let rollAngle = 0.2;
let rollVertical = 0.2, maxAngle = 1, minAngle = -1;
let score = 0;

//bullets
let enemyBullets = [];

//enemies
let enemies = [];

//enemy velocity
const enemySpeed = {
    airplane: 1,
    tank: 0.4,
    helicopter: 0.5,
};

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

function Start() {
    importModels();

    startGame();

    
    // Movimentação e disparo
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    const engineSFX = document.getElementById("engineSound");
    engineSFX.loop = true; // Define o som para tocar em loop
    engineSFX.play();
    engineSFX.volume = 0.3; // Aumentar o volume
    const themeSFX = document.getElementById("themeSound");
    themeSFX.loop = true; // Define o som para tocar em loop
    themeSFX.play();
    themeSFX.volume = 0.5; // Aumentar o volume
    animate();
}

function GameLoop() {
    if (airplane) {
        handleGamepadInput();
        moveEnemyBullets();
        movePlayerBullets();
        moveEnemies();
        movePlayer();
  
        if (floor) {
          translate(floor.position, "z", speed);
          if (floor.position.z > 500) floor.position.z = 0;
        }
  
        // Atualizar score
        document.getElementById("finalScore").innerText = "Score: " + score;
  
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
  
        scene.traverse(function (object) {
          if (object.material) {
            // Verifique se o material tem o uniforme `time`
            if (object.material.uniforms && object.material.uniforms.time) {
              object.material.uniforms.time.value = clock.getElapsedTime();
            }
          }
        });
    }
}

function movePlayer() {
    handleGamepadInput();
    //handleKeyboardInput();
}

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

// player shoot
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
  
  // keyboard controller
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
  
  // gamepad controller
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
  
  // create explosion
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
  
  // end game
  function endGame() {
    document.getElementById("gameScreen").classList.remove("visible"); // Esconder tela de início
    document.getElementById("gameOverScreen").classList.add("visible"); // Esconder tela de game over
    resetGame();
  }
  
  // start game
  function startGame() {
    document.getElementById("gameScreen").classList.add("visible");
  }
  
  // reset game
  function resetGame() {
    score = 0;
    bullets.forEach((bullet) => scene.remove(bullet));
    enemies.forEach((enemy) => scene.remove(enemy));
    bullets = [];
    enemies = [];
  }

//spawn enemies logic
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

//enemy shoot time
function setEnemyShooting() {
    setInterval(() => {
        enemies.forEach((enemy) => {
        enemyShoot(enemy);
        });
    }, 3000);
}

//spawn enemies time
function spawnEnemy() {
    setInterval(function () {
        createEnemies(2, "tank", 0.4); // Exemplo: criar 5 inimigos a cada 3 segundos
    }, 5000);

    setInterval(function () {
        createEnemies(3, "helicopter", 1); // Exemplo: criar 5 inimigos a cada 3 segundos
    }, 8000);
}

//enemy shoot logic
function enemyShoot(enemy) {
  const bullet = missile.clone();

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

function importModels () {
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

function removeEnemyFromList(enemy, list) {
    const index = list.indexOf(enemy);
    if (index !== -1 && index) {
        list.splice(index, 1);
    }
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
  
  function movePlayerBullets() {
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
  

setGameStart(Start);
setGameLoop(GameLoop);
