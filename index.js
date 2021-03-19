import swapiDatabase from './swapiObject.js'

//SETTING UP ALL THE NEEDED VARIABLES

const selectionDiv = document.querySelector('#selection-div');
const categorySelect = document.querySelector('#category-select');
const numberInput = document.querySelector('#number-input');
const selectionButton = document.querySelector('#selection-button');
const infoDiv = document.querySelector('#info-display');
const reset = document.querySelector('#reset');
const back = document.querySelector('#back')
const searchBar = document.querySelector('#search-bar')
let category;
let idNumber;

//GRABS FIRST KEY OF LINKED OBJ, AND APPENDS LINK TO INFODIV

const linkSet = async (key, link) => {
    let first;
    let obj = await fetch(link).then(res => res.json())
    for (let key in obj) {
        first = obj[key];
        break;
    }

    let div = document.createElement('div');
    let a = document.createElement('a');
    a.setAttribute('href', link);
    a.classList.add('link');
    div.classList.add('text')
    a.innerHTML = `${key}:  ${first}`;
    div.appendChild(a);
    infoDiv.appendChild(div);
}

//SETS INTO FROM THE PASSED IN OBJS TO DIVS AND APPENS THEM TO INFODIV

const setInfo = async (apiObj) => {
    if (apiObj.detail) {
        let div = document.createElement('div');
        div.innerHTML = 'There is no entry at this index.'
        infoDiv.appendChild(div);
        return;
    }

    for (let key in apiObj) {
        let divPair = document.createElement('div');
        if (key != 'url' && key != 'created' && key != 'edited') {
            if (apiObj[key]) {
                if (Array.isArray(apiObj[key])) {
                    for (let newLink of apiObj[key]) {
                        await linkSet(key.toUpperCase(), newLink);
                    }
                } else if (typeof apiObj[key] == 'string' && apiObj[key].includes('http://')) {
                    await linkSet(key.toUpperCase(), apiObj[key]);
                } else {
                    divPair.innerHTML = `${key.toUpperCase()}:  ${apiObj[key]}`
                    divPair.classList.add('text')
                    infoDiv.appendChild(divPair);
                }
            }
        }
    }
}

//GETS REQUESTED OBJ FROM THE SERVER AND RUNS THE SETINFO FUNCTION WITH IT

const getResponse = async link => {
    let response = await fetch(link).then(res => res.json())
    localStorage.setItem('newLink', link)
    setInfo(response);
}

//LICKS FOR THE SUBMIT BUTTON TO BE CLICKED, TAKING INFO FROM INPUTS AND GRABS LINK, SENDING IT TO GETRESPONSE

selectionButton.addEventListener('click', async e => {
    if (numberInput.value) {
        infoDiv.innerHTML = ''
        category = categorySelect.value;
        idNumber = numberInput.value;

        numberInput.value = ''
        await getResponse(`https://swapi.dev/api/${category}/${idNumber}`);
    } else if (searchBar.value) {
        infoDiv.innerHTML = ''
        let key = searchBar.value;
        key = key.toLowerCase().trim()
        let url = swapiDatabase[key];
        localStorage.setItem('newLink', url)
        location.reload()
    }
})

//LISTENS FOR LINKS IN THE INFODIV TO BE CLICKED, TAKES THAT LINK AND REPLACES PAGE WITH RESPONSE OBJECT

infoDiv.addEventListener('click', async e => {
    if (e.target.classList.contains('link')) {
        e.preventDefault()
        if (localStorage.getItem('backLink')) {
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])
        } else {
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }
        localStorage.setItem('newLink', e.target.href)
        location.reload()
    }
})

//RESETS LOCALSTORAGE AND INFODIV ON CLICK

reset.addEventListener('click', e => {
    infoDiv.innerHTML = ''
    localStorage.clear()
    location.reload()
})

//LISTENS FOR A CLICK ON THE BACK BUTTON, REMOVING THE LAST ENTRY FROM THE LOCALSTORAGE AND CHANGING THE CURRENT PAGE TO IT

back.addEventListener('click', e => {
    if (localStorage.getItem('backLink')) {
        infoDiv.innerHTML = ''
        let backArr = localStorage.getItem('backLink').split(',');
        let backLast = backArr[backArr.length - 1];
        backArr.pop()
        localStorage.setItem('backLink', backArr);
        localStorage.setItem('newLink', backLast);
        location.reload()
    }
})

//IF THERE IS A NEW LINK IN LOCAL STORAGE, WILL FILL THE PAGE WITH IT.

let newLink = localStorage.getItem('newLink')

if (newLink) {
    getResponse(newLink)
}
