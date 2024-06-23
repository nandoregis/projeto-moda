import * as THREE from '../build/three.module.js';

import Camera from './Camera.js';
import Controls from './Controls.js';
import CreateScene from './CreateScene.js';
import Decal from './Decal.js';
import HDR from './HDR.js';
import Model3D from './Model3D.js';

export default class Viewer2
{   
    #scene;
    #renderer;
    #camera;
    #controls;
    #elHTML
    #model;
    #mixer;
    #clock;
    #decal;
    #actions;
    constructor(el) {
        
        this.#elHTML = el;
        this.animate = this.animate.bind(this);

        this.#scene = new CreateScene;
        this.#camera = new Camera(el.clientWidth, el.clientHeight);
        this.#clock = new THREE.Clock();
        this.#decal = new Decal(el, this.#scene.io(), this.#camera.io());
        
        this.#renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true
        });

        // CONFIGURAÇÃO DO RENDERER
        this.#renderer.setSize(el.clientWidth, el.clientHeight);
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        
        this.#renderer.outputEncoding = THREE.sRGBEncoding;
        this.#renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
        this.#elHTML.appendChild(this.#renderer.domElement);
        
        //--------------------------------------------------------------------

        this.#controls = new Controls(this.#camera.io(), this.#renderer.domElement);

        this.#lighAmbient();
        this.#lightDirectional();
        
        window.onresize = () => {
            this.#camera.aspect();
            this.#camera.updateProjectionMatrix();
            this.#renderer.setSize(this.#elHTML.clientWidth , this.#elHTML.clientHeight);
        }

    }

    #animation() {
        requestAnimationFrame(this.animation);
        
        if(this.#controls)  this.#controls.update();
        
        const delta = this.#clock.getDelta();
        if (this.#mixer) this.#mixer.update(delta);

        this.#renderer.render(this.#scene.io(), this.#camera.io());
    }

    async addModel(file) {
        const mod = new Model3D;
        this.#model = await mod.load(file);
        this.#decal.addDecalToMesh(this.#model);
        this.#generate(this.#model, mod.getClip());
        return mod;       
    }

    cube() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x0abf9d } );
        const cube = new THREE.Mesh( geometry, material );
        this.#scene.add( cube );

        this.#camera.positionZ(5);
    }

    #generate(model, clips) {
        model.updateMatrixWorld();

        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3(0,0,0));
        var center = box.getCenter(new THREE.Vector3());

        model.position.x += center.x;
		model.position.y -= center.y;
		model.position.z -= center.z;

        this.#camera.positionZ(size.length() * 1.2);

        this.#controls.scrollMin(size.x);
        this.#controls.scrollMax(size.x * 3.5);        
        
        this.#scene.add(model);

        this.#action(model, clips)
    }

    getDecal() { return this.#decal}

    #action(model, clips) {
        this.#mixer = new THREE.AnimationMixer(model);

        clips.forEach( clip => {
            this.#actions = this.#mixer.clipAction(clip);
        });

    }

    animate(bool) {
        if(bool) {
            this.#actions.play();
        }else {
            this.#actions.stop();
        }
    }

    #lighAmbient() {
        this.light = new THREE.AmbientLight(0xffffff, 1);
        this.#scene.add(this.light);
    }

    #lightDirectional() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // this.directionalLight.castShadow = true;
        // this.directionalLight.shadow.bias = -0.0001;
        // this.directionalLight.shadow.mapSize.width = 2048;
        // this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.position.set(1,0.5,2);
        this.#scene.add(this.directionalLight);
    }

    activeHDR() {return new HDR(this.#scene.io());}
    getControl() {return this.#controls;}

    async run() {
        this.animation = this.#animation.bind(this);
        requestAnimationFrame(this.animation);
    }
   
}