export default {
  start: function(scene) {
    console.log('Iniciando o jogo...');

    // Cria um cubo e adiciona à cena
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);  // Define o cubo no escopo global
    scene.add(cube);  // Adiciona o cubo à cena
  },

  gameLoop: function(cube) {
    // Lógica para rodar em cada frame de animação
    console.log('Executando o game loop...');

    // Faz o cubo rotacionar
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
};
