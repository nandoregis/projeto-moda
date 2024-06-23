import * as THREE from '../build/three.module.js';
import {OrbitControls} from '../jsm/OrbitControls.js';
import {GLTFLoader} from '../jsm/GLTFLoader.js';
import {RGBELoader} from '../jsm/RGBELoader.js';
import {DRACOLoader} from '../jsm/DRACOLoader.js';
import {DecalGeometry} from '../jsm/DecalGeometry.js';


import Viewer from './classes/null.js';

const container = document.querySelector('.teste');
const up = document.getElementById('uploadImg');
const img = document.getElementById('imagemUp');
const labelImg = document.getElementById('labelUploadImg');


const size = document.getElementById('size');

// renderirzar modelo
const view = new Viewer(container, './models/camiseta.gltf');

var imgTexture, cursorGrab = true, decals, imagem;

(async () => {
    
    await view.run();
    
    const mesh = view.getMesh();

    console.log(mesh);

    // FOCAR NESSE FUNÇÃO PARA ADICIONAR DECAL - DA MUITO CERTO
    up.addEventListener('change', (e) => {
        
        const reader = new FileReader();
        const file = e.target.files[0];

        var width = document.getElementById('size-width').value;
        var height = document.getElementById('size-height').value;

        
        reader.onload = (e) => {
            imagem = e.target.result;
            img.setAttribute('src', imagem);
            
            labelImg.children[0].style.display = 'none';
            img.style.display = 'inline-block';

            // mudar cursor
            cursorGrab = false;
            container.classList.add('point');

            // validação rapida de tamanho    
            if(!width || !height) { width, height = 1;}
    
            view.activeClickEventListernerDecal(mesh[0], {
                texture: imagem,
                width: width,
                height: height
            });
        }

        
        if(file) {
            reader.readAsDataURL(file);
        }
    
    });


    container.addEventListener('mousedown', () => {
        if (cursorGrab) {
            container.classList.remove('point');
            container.classList.add('grabbing');
        }
    });

    container.addEventListener('mouseup', () => {
        if(cursorGrab) {
            container.classList.remove('point');
            container.classList.remove('grabbing');
        }
    });


    // const onClick = (event) => {

    //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //     raycaster.setFromCamera(mouse, camera);

    //     const intersects = raycaster.intersectObjects(scene.children, true);

    //     if (intersects.length > 0) {
    //         const intersectedObject = intersects[0].object;

    //         const position = intersects[0].point;
    //         const orientation = new THREE.Euler();
    //         const size = new THREE.Vector3(0.5, 0.5, 0.5);

    //         view.addDecal2(intersectedObject, position, orientation, size);
    //     }
    // }


})();



