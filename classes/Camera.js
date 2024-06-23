import * as THREE from '../build/three.module.js';

export default class Camera
{   
    #camera;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.#camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    }

    aspect( width = this.width, height = this.height ) {
        this.#camera.aspect = width / height;
    }

    updateProjectionMatrix() {
        this.#camera.updateProjectionMatrix();
    }

    positionX(value) {this.#camera.position.x = value;}
    positionY(value) {this.#camera.position.y = value;}
    positionZ(value) {this.#camera.position.z = value;}

    io() {
        return this.#camera;
    }
   
}