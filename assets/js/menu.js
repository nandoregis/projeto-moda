const boxDecal = document.getElementById('markings__box');
const ModalImg = document.getElementById('modal-add-image');
const closeModalImg = document.getElementById('close-modal-img');
const uploadImg = document.getElementById('uploadImg');

const inputWid = document.getElementById('decal-width');
const inputHeg = document.getElementById('decal-height');

const decals = [];
var removeDecal, textureDecal;

const menuEvents = () => {
    const markingList = document.querySelectorAll('.marking-list');

    markingList.forEach( el => {

        const btnAddimage = el.children[1];
        const btnDelete = el.children[2];
        const markingItem = {
            text: el.children[0].children[0],
            input: el.children[0].children[1]
        }
        
        el.addEventListener('click', (e) => {
            
            clearMarkListSelect();
            e.currentTarget.classList.add('selected');

            let decal = decals[ parseInt(e.currentTarget.getAttribute('key')) ];

            if(decal) {
                inputWid.value = decal._width;
                inputHeg.value = decal._height;
    
                inputWid.parentNode.setAttribute('decal-id', decal._id);
                inputHeg.parentNode.setAttribute('decal-id', decal._id);
            }
        
        });

        /**
         * DUAL CLICK - INPUT FICA DISPONIVEL PARA ALTERAÇÃO DO NOME
         */
        el.addEventListener('dblclick', () => {
            markingItem.input.parentNode.classList.add('dbl'); 
            markingItem.input.focus();
            markingItem.input.select();
        });

        /**
         *  AO APERTAR O ENTER SALVA O QUE ESTA ESCRITO NO INPUT DE ALTERAR NOME DECAL
         */
        markingItem.input.addEventListener('change', (e) => {
    
            let decal = decals[ parseInt(e.target.parentNode.parentNode.getAttribute('key')) ];
            
            if (markingItem.input.value === "") markingItem.input.value = markingItem.text.innerHTML;
         
            markingItem.text.innerHTML = markingItem.input.value;
            decal._name = markingItem.text.innerHTML;
            markingItem.input.setAttribute('value', decal._name);
            markingItem.input.parentNode.classList.remove('dbl'); 
            
        });  
        
        // evento de remover a marcação
        btnDelete.addEventListener('click', (e) => {
            let index = parseInt(e.currentTarget.parentNode.getAttribute('key'));
            ModalImg.classList.add('hide');
            
            removeDecal(decals[index]._uuid);
            decals.splice(index, 1);
            el.remove();
        
        });

        btnAddimage.addEventListener('click', (e) => {
            let uuid = e.currentTarget.getAttribute('decal');
            uploadImg.parentNode.setAttribute('decal', uuid);
            ModalImg.classList.remove('hide');
        });

    });

}

closeModalImg.addEventListener('click', () => {
    ModalImg.classList.add('hide');
})

// percorrer todos os elemento para limpar a class select
const clearMarkListSelect = () => {
    const markingList = document.querySelectorAll('.marking-list');
    for(let i = 0; i < markingList.length; i++) markingList[i].classList.remove('selected');
    
}

const criarDecalHTML = (decalId, decalUuid) => {
    clearMarkListSelect();

    const decal = `
        <li key="${decalId - 1}" class="marking-list selected">
            <p class="marking-item">
                <span class="marking-item__description icon-mark">Mark ${decalId}</span>
                <input type="text" value="Mark ${decalId}">
            </p>
            <p decal="${decalUuid}" class="marking-add-image">
                <img src="./assets/img/icon-plus.svg" alt="" srcset="">
            </p>
            <p decal="${decalUuid}" class="marking-delete">
                <img src="./assets/img/icon-delete.svg" alt="" srcset="">
            </p>
        </li>
    `;

    boxDecal.innerHTML += decal;
    
}

uploadImg.addEventListener('change', (e) => {
    const reader = new FileReader();
        const file = e.target.files[0];        

        reader.onload = (e) => {
            let imagem = e.target.result;
            let uuid = uploadImg.parentNode.getAttribute('decal');

            console.log(uuid);
            textureDecal(uuid, imagem);
            ModalImg.classList.add('hide');
        }

        
        if(file) {
            reader.readAsDataURL(file);
        }
});

export const toShareDecalRemoveFunc = (func) => {
    removeDecal = func;
}

export const toShareDecalTextureFunc = (func) => {
    textureDecal = func
}

export const toShareDecal = (decal) => {
    decals.push(decal);
    criarDecalHTML(decal._id, decal._uuid);
    menuEvents();
}


