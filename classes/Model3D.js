import * as THREE from '../build/three.module.js';
import {GLTFLoader} from '../jsm/GLTFLoader.js';
import {DRACOLoader} from '../jsm/DRACOLoader.js';

export default class Model3D
{   
    #scene;
    #clips = [];
    #loader;
    #dracoLoader;
    #modelMesh = [];
    #textureLoader;
    constructor() {
        // LOADER E DRACOLOADER E RGBELOADER
        this.#loader = new GLTFLoader();
        this.#dracoLoader = new DRACOLoader();
        this.#dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // decoders do draco
        this.#loader.setDRACOLoader( this.#dracoLoader );

        this.#textureLoader = new THREE.TextureLoader();
    }

    applyTexture(normalMapUrl) {
        this.#textureLoader.load(normalMapUrl, (normalMap) => {
            this.#scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.normalMap = normalMap;
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    load(file) {
        return new Promise((resolve, reject) => {
            this.#loader.load(file, (gltf) => {

                this.#scene = gltf.scene || gltf.scenes[0];
                this.#clips = gltf.animations || [];

                this.#filterMeshModel(this.#scene.children)

                if (!this.#scene) {
                    // Valid, but not supported by this viewer.
                    throw new Error(
                        'Nâo contem cena' +
                            ' - Verificar o modelo se é gltf ou glb',
                    );
                }

                resolve(this.#scene);
            }, undefined, (error) => {
                reject(error);
            });
        });
    }

    getClip() { return this.#clips;}
    getMesh() { return this.#modelMesh}
    getScene() { return this.#scene}

    #filterMeshModel(children) {

        let child;
        let count = children.length;
        
        if(count === 0) {return Array() ;}

        for (let i = 0; i < count; i++ ) {

            child = children[i];

            if( child.type === 'Mesh' ) {
                this.#modelMesh.push(child);
                child.children.splice(i,1);
            }

            if(child.children) {
                this.#filterMeshModel(child.children);
            }

        }
    }

}