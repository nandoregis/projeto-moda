import * as THREE from '../build/three.module.js';
import {OrbitControls} from '../jsm/OrbitControls.js';
import {GLTFLoader} from '../jsm/GLTFLoader.js';
import {RGBELoader} from '../jsm/RGBELoader.js';
import {DRACOLoader} from '../jsm/DRACOLoader.js';
import {DecalGeometry} from '../jsm/DecalGeometry.js';

export default class Viewer 
{

    constructor(el, modelUrl) {

        this.el = el; // elemento html;

        this.model;
        this.allMesh = [];
        this.modelUrl = modelUrl;

        // VARIAVEIS DE INTRODUÇÃO DE DECAL
        this.decalMesh;
        this.selectMesh;
        this.decals = [];
        this.decalsClear = [];
        this.textureDecal;
        this.boundOnClickDecal = this.#onClickDecal.bind(this);
        this.boundOnClicked = false;
        this.clickPosition;

        // PARA ANIMAÇÃO
        this.clock = new THREE.Clock();

        // EVENTO DE CLICK PARA ADD DECAL
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000);
        this.scene.background = new THREE.Color(0x404040);

        // CONFIGURAÇÃO DO RENDERER
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            // alpha: true 
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(el.clientWidth, el.clientHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.el.appendChild(this.renderer.domElement); // adicionando o renderer no elemento DOM
        //---------------------------------------------------------

        
        // LOADER E DRACOLOADER E RGBELOADER
        this.loader = new GLTFLoader();
        this.hdrLoader = new RGBELoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // decoders do draco
        this.loader.setDRACOLoader( this.dracoLoader );
        //--------------------------------------------------------

        // CONFIGURAÇÃO CONTROLS 
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        //---------------------------------------------------------------

        this.#lighAmbient();
        this.#lightDirectional();

        // STATUS DO MODELO 3D
        this.statusModel = {
            avatar: {
                color: '#000000'
            },
            shirt: {
                color: '#000000'
            },
            decal: {
                width: 0.15,
                height: 0.15
            }
        }

        // STATUS DO AMBIENTE GERAL
        this.state = {
            bgColor: '#909090',
            bgActive: true,
        }

        window.onresize = () => {
            this.camera.aspect = el.clientWidth / el.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(el.clientWidth , el.clientHeight);

        }


        // this.run();
    }

    /**
     * METODO PARA CARREGAR O MODELO 3D 
     * @param {string} url 
     * @returns gltf
     */
    #loadModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (gltf) => {

                const scene = gltf.scene || gltf.scenes[0];
                const clips = gltf.animations || [];

                this.#setContent(scene, clips);
				
                // this.#listMesh(scene.children);

                if (!scene) {
                    // Valid, but not supported by this viewer.
                    throw new Error(
                        'Nâo contem cena' +
                            ' - Verificar o modelo se é gltf ou glb',
                    );
                }

                // this.#setContent(scene, clips);

                resolve(gltf);
            }, undefined, (error) => {
                reject(error);
            });
        });
    }

    #lightDirectional() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // this.directionalLight.castShadow = true;
        // this.directionalLight.shadow.bias = -0.0001;
        // this.directionalLight.shadow.mapSize.width = 2048;
        // this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.position.set(1,0.5,2);
        this.scene.add(this.directionalLight);
    }

    #lighAmbient() {
        this.light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.light);
    }

    /**
     * METODO PARA CARRECA O HDR
     * @returns true
     */
    #loadHDR() {
        return new Promise( (resolve, reject) => {
            this.hdrLoader
            .setPath('./')
            .load('neon_photostudio_2k.hdr', (texture) => {

                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = texture;

                resolve(true);
            }, undefined, (error) => {
                reject(error)
            }); 
        })
    }

    /**
     * METÓDO PARA LISTAR TODAS AS MESH PARA PODER MODIFICAR COMO NECESSARIO
     * @param {Array} children 
     * @returns 
     */
    async #listMesh(children) {
        // Object3D
        // Mesh

        let child;
        let count = children.length;
        
        if(count === 0) {return Array() ;}

        for (let i = 0; i < count; i++ ) {

            child = children[i];

            if( child.type === 'Mesh' ) {
                this.allMesh.push(child);
                child.children.splice(i,1);
            }

            if(child.children) {
                this.#listMesh(child.children);
            }

        }

    }

    getMesh() {
       return this.allMesh;        
    }

    /**
     * METODO ASSINCRONO PARA ESPERAR O CARREGAMENTO DO MODELO 3D
     * @param {String} urlPath 
     * @return {Boolean}
     */
    async load(urlPath) {                           //<-------------------
        await this.#loadModel(urlPath);
        // await this.#loadHDR();
    }

    /**
     * MODELO PARA ADICIONAR A CENA DO MODELO 3D
     * @param {Object} model 
     * @param {Object} clips 
     */
    #setContent(model, clips) {
        model.updateMatrixWorld();
        this.model = model;

        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3(0,0,0));
        var center = box.getCenter(new THREE.Vector3());
        
        model.position.x += center.x;
		model.position.y -= center.y;
		model.position.z -= center.z;

        this.controls.minDistance = size.x * 1.5;
        this.controls.maxDistance = size.x * 3;

        this.camera.position.z = size.length() * 1.2;
        
        this.scene.add(model);

        this.mixer = new THREE.AnimationMixer(model);

        clips.forEach( clip => {
            this.mixer.clipAction(clip).play();
        });

    }

    /**
     * METÓDO PARA RENDERIZAR TODA A CENA E CAMERA
     */
    #render() {
        requestAnimationFrame(this.render);
        
        if(this.controls) {
            this.controls.update();
        }

        const delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);

        this.renderer.render(this.scene, this.camera);
    }

    add(modelUrl) {
       this.modelUrl = modelUrl; 
    }

    async run() {
        
        await this.load(this.modelUrl);
        await this.#listMesh(this.model.children);

        this.render = this.#render.bind(this);
        requestAnimationFrame(this.render);
    }

    addDecal(mesh, textura) {

        // Carregar a textura da decalagem
        const textureLoader = new THREE.TextureLoader();
        const decalTexture = textureLoader.load(textura);
        
        // Configurações da decalagem

        const decalMaterial = new THREE.MeshBasicMaterial({
            map: decalTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            side: THREE.FrontSide
            
        });

        // const position = new THREE.Vector3(0, 0.15, 1);  // Ajuste a posição para onde deseja aplicar a textura
        const orientation = new THREE.Euler(0, 0, 0);   // Ajuste a orientação conforme necessário
        const size = new THREE.Vector3(this.statusModel.decal.width, this.statusModel.decal.height, 2);  // Ajuste o tamanho para cobrir a área desejada
        
        const decalGeometry = new DecalGeometry(mesh, this.clickPosition, orientation, size);
        this.decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);

        const objDecal = {
            _key : this.decals.length,
            _decal: this.decalMesh,
        }
        
        this.scene.add(this.decalMesh);
        this.decals.push(this.decalMesh);

        setTimeout( () => {
            console.log('decal --> ', this.decalMesh);
        }, 1000);

        // this.clearThreadFromDecal();

    }

    clearThreadFromDecal() {
        
        if(this.decalsClear.length > 0) {
            
            let index = this.decalsClear.length - 1;
            let meshDelete = this.decalsClear[index];
            
            this.scene.remove(meshDelete);
            meshDelete.geometry.dispose();
            meshDelete.material.dispose();
            meshDelete = null;
            
            this.decalsClear.splice(index, 1);
        }

        this.decalsClear.push(this.decalMesh);

    }

    movimentMesh(bool) {
        this.controls.enabled = bool;
    }

    addDecal2(mesh, position, orientation) {

        const textura = this.textureDecal;

        // Carregar a textura da decalagem
        const textureLoader = new THREE.TextureLoader();
        const decalTexture = textureLoader.load(textura);
        
        // Configurações da decalagem

        const decalMaterial = new THREE.MeshBasicMaterial({
            map: decalTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            side: THREE.FrontSide
            
        });

        const size = new THREE.Vector3(this.statusModel.decal.width, this.statusModel.decal.height, 2);  // Ajuste o tamanho para cobrir a área desejada
        
        const decalGeometry = new DecalGeometry(mesh, position, orientation, size);
        this.decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);


        this.scene.add(this.decalMesh);
        this.decals.push(this.decalMesh);
        
    }

    convertSizeDecal(valor) {

        valor = Number(valor);

        console.log( typeof valor);

        if(typeof valor != 'number'){
            console.error('não é numero');
            return null;
        }
        // divisor é 10 - exemple 1 / 10 = 0.1
        return valor / 10;
    }

    activeClickEventListernerDecal(mesh, options) {
        if(typeof options != 'object') {return null;}
        
        
        this.selectMesh = mesh;
        this.textureDecal = options.texture;
        this.statusModel.decal.width = this.convertSizeDecal(options.width);
        this.statusModel.decal.height = this.convertSizeDecal(options.height);

        console.log('w:' + this.statusModel.decal.width + ' h :' + this.statusModel.decal.height);

        
        if (!this.boundOnClicked) {
            console.log('--------------------- TESTE DE CLICK ----------------------------------');
            this.el.addEventListener('click', this.boundOnClickDecal);

        }else {
            this.addDecal(this.selectMesh, this.textureDecal);
        }
      
    }

    removeClickEventListenerDecal() {
        this.el.removeEventListener('click', this.boundOnClickDecal);
        this.el.classList.remove('point');

        this.boundOnClicked = false;
    }
    
    #onClickDecal(event) {


        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            
            const intersectedObject = intersects[0].object;
            const position = intersects[0].point;
            const orientation = new THREE.Euler(0,0,0)

            var rand = Math.floor(position.z) === 0 ? 1 : Math.floor(position.z);
            position.z = rand;


            this.clickPosition = position;
            console.log('posição de click, ' , this.clickPosition.z);

            // this.addDecal2(intersectedObject, position, orientation);
        }

        this.removeClickEventListenerDecal();
        this.addDecal(this.selectMesh, this.textureDecal);
        
        this.boundOnClicked = true;
    } 


    
}