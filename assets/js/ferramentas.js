
export default function tools (obj) {

    const { 
        controls, decal,
        animate, toShareDecal, 
        toShareDecalRemove, 
        toShareTexture 
    } = obj;

    const container = document.getElementById('container');
    const renderModel = document.getElementById('render-model');
    const tools = document.getElementById('tools');

    const inputWid = document.getElementById('decal-width');
    const inputHeg = document.getElementById('decal-height');
    
    const mouseDefault = document.getElementById('mouse-default');
    const mouseMove = document.getElementById('mouse-move');
    const markDecal = document.getElementById('mark-decal');
    const resetDecal = document.getElementById('reset-decal');
    
    const cursor = [
        'crosshair',
        'grab',
        'grabbing',
        'default'
    ];

    const decals = [];
    var preloadDecal;
    var play = true;

    toShareDecalRemove(decal.remove);
    toShareTexture(decal.texture);

    const createPreloadDecal = () => {
        preloadDecal = {
            _id : decal.decalCount() + 1,
            _uuid: null,
            _name: `Mark ${decal.decalCount() + 1}`,
            _uuidModel: 'abcdefghij',
            _position : {x: 0, y: 0, z: 0} ,
            _width: 100,
            _height: 100,
            _image: null,
        }
    }
    
    const selectButtonClicked = (clicked) => {
        const childrens = tools.children;
        for(let i = 0; i < childrens.length; i++) childrens[i].classList.remove('clicked');
        clicked.classList.add('clicked');
    }
    
    const selectCursor = ( cur = 'default') => {
       for(const i in cursor) {
            renderModel.classList.remove(cursor[i]);
       }
    
       renderModel.classList.add(cur);
    }
    
    mouseDefault.addEventListener('click', () => {
        selectButtonClicked(mouseDefault);
        selectCursor();
        controls.off();
        preloadDecal = null
    });
    
    mouseMove.addEventListener('click', () => {
        selectButtonClicked(mouseMove);
        selectCursor(cursor[1]);
        controls.on();
        preloadDecal = null
    });
    
    // fazer aqui
    markDecal.addEventListener('click', () => {
        selectButtonClicked(markDecal);
        selectCursor(cursor[0]);
        controls.off();
        createPreloadDecal();
        inputWid.value = preloadDecal._width;
        inputHeg.value = preloadDecal._height;
    });

    inputWid.addEventListener('change', () => {
        
        let val = inputWid.value;

        if(val == '') val =  '100';
        if(val.includes('e')) val = val.replace('e', '');
        
        val = parseInt(val);
        inputWid.value = val;

        if(!preloadDecal)  { 
            
        } else { 
            preloadDecal._width = val;
            inputWid.parentNode.setAttribute('decal-id', preloadDecal._id);
        };

    });

    inputHeg.addEventListener('change', () => {
        let val = inputHeg.value;

        if(val == '') val =  '100';
        if(val.includes('e')) val = val.replace('e', '');
        val = parseInt(val);

        inputHeg.value = val;

        if(!preloadDecal)  { 
            
        } else { 
            preloadDecal._height = val;
            inputHeg.parentNode.setAttribute('decal-id', preloadDecal._id);
        };

    });
    
    resetDecal.addEventListener('click', () => {
        selectButtonClicked(resetDecal);
        selectCursor();
        controls.off();
        controls.rotation(play);
        play = !play;
    });
    
    renderModel.addEventListener('mousedown', () => {
        if(renderModel.classList.contains('grab')) {
            selectCursor(cursor[2]);
        }
    })
    
    renderModel.addEventListener('mouseup', () => {
        if(renderModel.classList.contains('grabbing')) {
            selectCursor(cursor[1]);
        }
    })

    renderModel.addEventListener('click', (e) => {
        if(renderModel.classList.contains(cursor[0])) { 
            
            decal.setHeight(preloadDecal._height);
            decal.setWidth(preloadDecal._width);
            
            decal.click(e);

            if(preloadDecal) 
            {
                preloadDecal._position.x = decal.getPosition().x;
                preloadDecal._position.y = decal.getPosition().y;
                preloadDecal._position.z = decal.getPosition().z;
                preloadDecal._uuid = decal.io().uuid;
                
                decals.push(preloadDecal);
                toShareDecal(preloadDecal);
                
            }
            
            selectCursor(cursor[3]);
            selectButtonClicked(mouseDefault);
            
            preloadDecal = null;
        };
    });

}


