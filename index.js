import Viewer from "../classes/Viewer.js";
import tools from "./assets/js/ferramentas.js";
import {toShareDecal, toShareDecalRemoveFunc, toShareDecalTextureFunc} from "./assets/js/menu.js";

( async () => {
    
    const renderModel = document.getElementById('render-model');

    const view = new Viewer(renderModel);
    const modelo = await view.addModel('./models/t-shirt.glb');
    
    // const hdr = view.activeHDR();
    // await hdr.load();  
    
    view.run();

    tools({
        controls: view.getControl(),
        decal: view.getDecal(),
        toShareDecal: toShareDecal,
        toShareDecalRemove: toShareDecalRemoveFunc,
        toShareTexture: toShareDecalTextureFunc,
        animate: view.animate
    });

    
})();
