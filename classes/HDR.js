import * as THREE from '../build/three.module.js';
import {RGBELoader} from '../jsm/RGBELoader.js';

export default class HDR
{   

    #hdrLoader;
    #scene;
    #hdrInitial;

    constructor(scene) {
        this.#scene = scene;
        this.#hdrLoader = new RGBELoader();
        this.#hdrInitial = 'neon_photostudio_2k.hdr';
    }
    
    async load(file = this.#hdrInitial) {
        return new Promise( (resolve, reject) => {
            this.#hdrLoader
            .setPath('./hdr/')
            .load(file, (texture) => {
    
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.#scene.environment = texture;
    
                resolve(true);
            }, undefined, (error) => {
                reject(error)
            }); 
        })
    }

    
}
