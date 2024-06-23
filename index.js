import Viewer from "../classes/Viewer.js";
import tools from "./assets/js/ferramentas.js";
import {toShareDecal} from "./assets/js/menu.js";

( async () => {
    
    const renderModel = document.getElementById('render-model');

    const view = new Viewer(renderModel);
    const modelo = await view.addModel('./models/t-shirt.glb');
    
    // const hdr = view.activeHDR();
    // await hdr.load();  

    console.log();
    
    window.addEventListener('keyup', (e) => {
        
        if(e.key === 'ArrowUp') {
            modelo.applyTexture('menegotti-co-30.png');

            // modelo.getMesh()[0].material.color = '#c0c0c0';
        }
    });
    
    view.run();

    tools({
        controls: view.getControl(),
        decal: view.getDecal(),
        toShareDecal: toShareDecal,
        animate: view.animate
    });

    
})();
