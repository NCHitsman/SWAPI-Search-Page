// We use the object-creator.js function to create the object database stored in swapiObject and import it here for search functionality;
import swapiDatabase from './swapiObject.js'


//Here we set up all the veriables we will need below;
const categorySelect = document.querySelector('#category-select');
const numberInput = document.querySelector('#number-input');
const selectionButton = document.querySelector('#selection-button');
const infoDiv = document.querySelector('#info-display');
const reset = document.querySelector('#reset');
const back = document.querySelector('#back')
const searchBar = document.querySelector('#search-bar')


//We check if there is a current page in the local storage, if so, load it up. We end up using this to load almost everything;
if (localStorage.getItem('newLink')) {
    getResponse(localStorage.getItem('newLink'))
}


//This is the listener attached to the Search button, it will listen for 1) a category and id number, or 2) an input in the search bar;
selectionButton.addEventListener('click', async e => {
    if (numberInput.value) {
        let category = categorySelect.value;
        let idNumber = numberInput.value;
        if (localStorage.getItem('backLink')) {
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])
        } else {
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }
        localStorage.setItem('newLink', `https://swapi.dev/api/${category}/${idNumber}`)
        location.reload();
    } else if (searchBar.value) {
        let key = searchBar.value;
        key = key.toLowerCase().trim()
        let url = swapiDatabase[key];
        if (localStorage.getItem('backLink')) {
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])
        } else {
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }
        localStorage.setItem('newLink', url)
        location.reload()
    }
})


/*When an api url is loaded to the infoDiv, it will create links that lead to other api urls.
This listener will watch to see if someone clicks one of thos links; */
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


//The listener attachted to the back button. Will take you back to your recent pages;
back.addEventListener('click', e => {
    if (localStorage.getItem('backLink')) {
        let backArr = localStorage.getItem('backLink').split(',');
        let backLast = backArr[backArr.length - 1];
        backArr.pop()
        localStorage.setItem('backLink', backArr);
        localStorage.setItem('newLink', backLast);
        location.reload()
    }
})


//Will reset the page and local storage;
reset.addEventListener('click', e => {
    localStorage.clear()
    location.reload()
})


//The function that takes a link and sends a request for data to the server using fetch;
async function getResponse(link) {
    let response = await fetch(link)
    let data = await response.json();
    console.log(response, data);
    localStorage.setItem('newLink', link)
    setInfo(data);
}


//This function is responsable for filling the HTML with the required elements to present the passed in data;
async function setInfo(apiObj) {
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
                } else if (typeof apiObj[key] == 'string' && apiObj[key].includes('https://')) {
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


//We move into this function a key has a link for a value, and we take that link and hyperlink it;
async function linkSet(key, link) {
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
