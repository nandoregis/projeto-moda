import * as THREE from '../build/three.module.js';

export default class CreateScene
{   
    #scene;
    #meshesRemoved = [];
    #meshsOnScene = [];
    constructor() {
        this.#scene = new THREE.Scene();
    }
    
    add(mesh) {
        this.#scene.add(mesh);
        this.#meshsOnScene.push(mesh);
    }

    remove(mesh) {
        this.#meshesRemoved.push(mesh);
        this.#scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    io() {
        return this.#scene;
    }
    
}