import * as THREE from '../build/three.module.js';
import {DecalGeometry} from '../jsm/DecalGeometry.js';

export default class Decal
{   
    #decal;
    #decals = [];
    #textureDecal;
    #camera;
    #scene;
    #el
    #clickPosition; 
    #width; #height;
    #decalToMesh;
    #decalTrash;
    #textureLoader;
    #mouse;
    #raycaster;
    constructor(el, scene, camera) {
        this.#el = el;
        this.#scene = scene;
        this.#camera = camera;
        this.#width = 0.1;
        this.#height = 0.1;
        this.#textureDecal = 'mark.png';
        this.remove = this.remove.bind(this);
        this.texture = this.texture.bind(this);

        this.#raycaster = new THREE.Raycaster();
        this.#mouse = new THREE.Vector2();
        this.#textureLoader = new THREE.TextureLoader();
    }

    io() {return this.#decal;}
    getPosition() { return this.#clickPosition;}

    #convertSize(value) {return value / 1000;}
    setWidth(w) {this.#width = this.#convertSize(w);}
    setHeight(h) {this.#height = this.#convertSize(h);}
    addDecalToMesh(mesh) {this.#decalToMesh = mesh;}
    decalCount() {return this.#decals.length}

    resize(uuid, w, h) {
        this.#decal = this.filter(uuid);
        this.setWidth(w);
        this.setHeight(h);
        this.#setDecalSize();
    }

    filter(uuid) {return this.#decals.filter( (item) => {return item.uuid === uuid})[0];}

    texture(uuid, texture){

        console.log(this.#decals)

        this.#decal = this.filter(uuid);
        console.log(this.#decal)
        this.#updateTexture(texture);
    }

    #updateTexture(textureUrl) {
        this.#textureLoader.load(textureUrl, (texture) => {
            this.#decal.material.map = texture;
            this.#decal.material.needsUpdate = true;
        });
    }

    remove(uuid) {
        this.#decalTrash = this.filter(uuid);
        let trash = this.#decalTrash;
        this.#scene.remove(trash);
        trash.geometry.dispose();
        trash.material.dispose();
        this.#decals = this.#decals.filter( (item) => {return item.uuid !== uuid});
    }

    getDecalTrash() { return this.#decalTrash;}

    #add(mesh, textura) {
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

        
        const orientation = new THREE.Euler(0, 0, 0);

        const size = new THREE.Vector3(this.#width, this.#height, 2);
    
        const position = this.#clickPosition;
        
        const decalGeometry = new DecalGeometry(mesh, position, orientation, size);
        this.#decal = new THREE.Mesh(decalGeometry, decalMaterial);
        
        this.#scene.add(this.#decal);
        this.#decals.push(this.#decal);
        
    }

    #setDecalSize() {

        if (this.#decal) {
            const position = this.#decal.position.clone();
            const orientation = this.#decal.rotation.clone();

            const size = new THREE.Vector3(this.#width, this.#height, 2);
            const decalGeometry = new DecalGeometry(this.#decal, position, orientation, size);

            this.#decal.geometry.dispose(); // Limpar a geometria antiga
            this.#decal.geometry = decalGeometry;

            console.log(`Novo tamanho do decal - Width: ${this.#width}, Height: ${this.#height}, Depth: ${2}`);
        } else {
            console.warn('Nenhum decal encontrado para redefinir o tamanho.');
        }
    }
    
    click(event) {
        
        this.#mouse.x =  (event.clientX  / this.#el.clientWidth) * 2 - 1;
        this.#mouse.y = - (event.clientY / this.#el.clientHeight) * 2 + 1.082;
        
        this.#raycaster.setFromCamera(this.#mouse, this.#camera);
        
        const intersects = this.#raycaster.intersectObjects(this.#scene.children, true);
        
        if (intersects.length > 0) {

            const intersectedObject = intersects[0].object;
            const position = intersects[0].point;
            
            position.z = Math.floor(position.z) === 0 ? 1 : Math.floor(position.z);
            this.#clickPosition = position;
            
            this.#add(intersectedObject, this.#textureDecal);
        }
    }
  
}
