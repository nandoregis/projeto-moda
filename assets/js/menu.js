const boxDecal = document.getElementById('markings__box');
const ModalImg = document.getElementById('modal-add-image');
const closeModalImg = document.getElementById('close-modal-img');

const inputWid = document.getElementById('decal-width');
const inputHeg = document.getElementById('decal-height');

const decals = [];

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

            inputWid.value = decal._width;
            inputHeg.value = decal._height;

            console.log(inputWid)
        
            // inputHeg.parentNode.setAttribute('decal-id', decal._id);
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
        markingItem.input.addEventListener('change', () => {
    
            if (markingItem.input.value === "") markingItem.input.value = markingItem.text.innerHTML;
                
            markingItem.text.innerHTML = markingItem.input.value;
            markingItem.input.parentNode.classList.remove('dbl'); 
            
        });

        // evento de remover a marcação
        btnDelete.addEventListener('click', (e) => {
            let id = e.currentTarget.getAttribute('decal');
            el.remove();
        });

        btnAddimage.addEventListener('click', (e) => {
            let id = e.currentTarget.getAttribute('decal');
            ModalImg.classList.remove('hide');
        });

        closeModalImg.addEventListener('click', () => {
            ModalImg.classList.add('hide')
        })

    });


}


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
                <input type="text" name="" value="Mark ${decalId}">
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

export const toShareDecal = (decal) => {
    decals.push(decal);
    criarDecalHTML(decal._id, decal._uuid);
    menuEvents();
}
