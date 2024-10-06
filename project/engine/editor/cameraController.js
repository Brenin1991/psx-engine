import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";
import { initializeWithRetry } from '../initialization.js';

let camera;
let control;
let transformControls;
let sceneObjects;
export function gameStart() {
    PSX.setUpEditor();
    transformControls = PSX.transformControl();
    
    // Adiciona evento para atualizar o inspetor quando o objeto é transformado
    transformControls.addEventListener('change', UpdateTransformInspector);

    if (!sceneObjects) {
        sceneObjects = PSX.returnSceneObjectsList();
        console.log(sceneObjects.length);
        displaySceneObjects();
    } 
}

export function gameLoop() {
    //if (control) {
        //control.update();
   // }

    if (transformControls) {
        document.getElementById('translateButton').addEventListener('click', () => {
            transformControls.setMode('translate');
        });
        document.getElementById('rotateButton').addEventListener('click', () => {
            transformControls.setMode('rotate');
        });
        document.getElementById('scaleButton').addEventListener('click', () => {
            transformControls.setMode('scale');
        });
    }
}

let selectedButton = null; // Variável para rastrear o botão selecionado
let selectedObject = null;

function displaySceneObjects() {
    const container = document.getElementById('sceneObjectsContainer');
    container.innerHTML = ''; // Limpa o conteúdo existente

    sceneObjects.forEach((object, index) => {
        const objectName = object.name || 'undefined'; // Usa 'undefined' se não tiver nome
        const button = document.createElement('button');
        button.textContent = `Object ${index + 1}: ${objectName}`; // Exibe o nome ou 'undefined'
        button.classList.add('scene-object-button'); // Adiciona uma classe para estilização
        
        // Adiciona o evento de clique para selecionar o botão
        button.addEventListener('click', () => {
            if (selectedButton) {
                selectedButton.classList.remove('selected'); // Remove a classe do botão anteriormente selecionado
            }
            selectedButton = button; // Atualiza o botão selecionado
            selectedButton.classList.add('selected'); // Adiciona a classe de seleção
            handleObjectClick(object); // Chame a função para manipular o clique
        });

        container.appendChild(button);
    });
}

function handleObjectClick(object) {
    selectedObject = object.gameObject;
    console.log('Clicked on:', selectedObject);
    PSX.setAttach(selectedObject);
    UpdateTransformInspector(); // Atualiza o inspetor ao selecionar um objeto
}

function UpdateTransformInspector() {
    if (selectedObject) {
        document.getElementById('positionX').value = selectedObject.position.x.toFixed(2);
        document.getElementById('positionY').value = selectedObject.position.y.toFixed(2);
        document.getElementById('positionZ').value = selectedObject.position.z.toFixed(2);

        document.getElementById('rotationX').value = selectedObject.rotation.x.toFixed(2);
        document.getElementById('rotationY').value = selectedObject.rotation.y.toFixed(2);
        document.getElementById('rotationZ').value = selectedObject.rotation.z.toFixed(2);

        document.getElementById('scaleX').value = selectedObject.scale.x.toFixed(2);
        document.getElementById('scaleY').value = selectedObject.scale.y.toFixed(2);
        document.getElementById('scaleZ').value = selectedObject.scale.z.toFixed(2);
    }
}

// Adicione eventos para atualizar as propriedades ao editar cada campo
document.getElementById('positionX').addEventListener('change', (event) => {
    selectedObject.position.x = parseFloat(event.target.value) || 0;
});

document.getElementById('positionY').addEventListener('change', (event) => {
    selectedObject.position.y = parseFloat(event.target.value) || 0;
});

document.getElementById('positionZ').addEventListener('change', (event) => {
    selectedObject.position.z = parseFloat(event.target.value) || 0;
});

document.getElementById('rotationX').addEventListener('change', (event) => {
    selectedObject.rotation.x = parseFloat(event.target.value) || 0;
});

document.getElementById('rotationY').addEventListener('change', (event) => {
    selectedObject.rotation.y = parseFloat(event.target.value) || 0;
});

document.getElementById('rotationZ').addEventListener('change', (event) => {
    selectedObject.rotation.z = parseFloat(event.target.value) || 0;
});

document.getElementById('scaleX').addEventListener('change', (event) => {
    selectedObject.scale.x = parseFloat(event.target.value) || 1;
});

document.getElementById('scaleY').addEventListener('change', (event) => {
    selectedObject.scale.y = parseFloat(event.target.value) || 1;
});

document.getElementById('scaleZ').addEventListener('change', (event) => {
    selectedObject.scale.z = parseFloat(event.target.value) || 1;
});
