let gameStart = null;
let gameLoop = null;

const fileSystem = {
  models: "models",
  sounds: "sounds",
  texture: "textures",
  scripts: "scripts",
};
let scene, camera, renderer, composer;

const globalColor = 0xf7f6f6;
const lightColor = 0xffe0ad;
const ambientColor = 0xdddad4;

const light = new THREE.DirectionalLight(globalColor, 1);
light.position.set(5, 5, 5);
const lightDirection = new THREE.Vector3();
light.getWorldDirection(lightDirection);

const lightColorValue = new THREE.Color(lightColor);
const ambientLightColorValue = new THREE.Color(ambientColor); // Cor inicial da luz ambiente

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

let vertexShader;
let fragmentShader;

function init() {
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(60, 640 / 480, 0.1, 300);
  camera.position.z = 7;
  camera.position.y = 3;

  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const canvas = document.getElementById("gameCanvas");
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

  instantiate(light);

  scene.fog = new THREE.Fog(globalColor, 100, 300); // Cor do fog, distância inicial, distância máxima

  scene.background = new THREE.Color(0xff3c12); // Cor em hexadecimal

  const skyLoader = new THREE.CubeTextureLoader();
  const skyboxTexture = skyLoader.load([
    "sky/bluecloud_rt.jpg", // direita
    "sky/bluecloud_lf.jpg", // esquerda
    "sky/bluecloud_up.jpg", // cima
    "sky/bluecloud_dn.jpg", // baixo
    "sky/bluecloud_ft.jpg", // frente
    "sky/bluecloud_bk.jpg", // trás
  ]);

  // (Descomente a linha abaixo se você quiser usar o skybox)
  scene.background = skyboxTexture; // Isso irá sobrepor a cor de fundo

  // Composer para efeitos de pós-processamento
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
/*
  loadShaders();
  loadFilters();

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
  */
}

let keys = {};

function onKeyDown(event) {
  keys[event.key] = true;
}

function onKeyUp(event) {
  keys[event.key] = false;
}

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Limitar a taxa de FPS
  if (lastRender + interval < elapsedTime * 1000) {
    lastRender = elapsedTime * 1000; // Atualiza o tempo do último render

    frameCount++;

    // Calcular FPS a cada segundo
    if (elapsedTime - lastTime >= 1) {
      fps = frameCount; // Armazena o número de frames em um segundo
      frameCount = 0; // Reseta o contador
      lastTime = elapsedTime; // Atualiza o último tempo
      console.log(`FPS: ${fps}`); // Exibe FPS no console
      document.getElementById("fps-count").innerText = `FPS: ${fps}`;
    }
/*
    if (pixelShader.uniforms.time) {
      pixelShader.uniforms.time.value = clock.getElapsedTime();
    }*/

    // Renderizar cena com efeito de pós-processamento
    composer.render();
  }
}
/*
// Exportando funções para o game.js
function setGameStart(fn) {
  gameStart = fn;
}

function setGameLoop(fn) {
  gameLoop = fn;
}*/

// Iniciar o jogo
init();

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

window.addEventListener("keydown", (event) => {
  if (event.key === "q") {
    toggleCrtFX();
  }
});

function loadShaders() {
  let vertexShader = `
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

  let fragmentShader = `
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
