import * as PSX from '../psx-engine-dist.js';
import Vector3 from "../psx-engine-dist.js";

let camera;
let control;
let transformControls;
export function gameStart() {
    control = PSX.getEditorCamera();
    transformControls = PSX.transformControl();
}

export function gameLoop() {
    if(control) {
        control.update();
    }

    if(transformControls) {
        //transformControls.update();
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
