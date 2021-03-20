// We use the object-creator.js function to create the object database stored in swapiObject and
// import it here for search functionality;
import swapiDatabase from './swapiObject.js'


//Here we set up all the veriables we will need below;
const categorySelect = document.querySelector('#category-select');
const numberInput = document.querySelector('#number-input');
const selectionButton = document.querySelector('#selection-button');
const infoDiv = document.querySelector('#info-display');
const reset = document.querySelector('#reset');
const back = document.querySelector('#back')
const searchBar = document.querySelector('#search-bar')


// We check if there is a current page in the local storage, if so, load it up. We end up using this to load almost everything
if (localStorage.getItem('newLink')) {
    //If we have an item named 'newLink' in local storage we will run the getResponse function with it as an argument
    getResponse(localStorage.getItem('newLink'))
}


// This is the listener attached to the Search button, it will listen for
// 1) a category and id number, or 2) an input in the search bar
selectionButton.addEventListener('click', async e => {
    // Here we diverge the logic into two seperate blocks, one that will deal with a
    // request using the category and id-number system, the other the search bar;

    // category id number system;
    if (numberInput.value) {
        // below we set the values of the two inputs into variables we can use later
        let category = categorySelect.value;
        let idNumber = numberInput.value;

        // this block of logic is used to set a localstorage item to record past pages
        // if 'backLink' already exists in local storage
        if (localStorage.getItem('backLink')) {
            // then add the current url onto the value of 'backLink'
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])

        } else {
            // otherwise create a 'backLink' key value pair using the current url
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }

        // here we set 'newLink' to the current url, interporlated with the values from the inputs
        localStorage.setItem('newLink', `https://swapi.dev/api/${category}/${idNumber}`)

        //*** IMPORTANT ***//
        // We have to reload after every new request because if we dont, the asynchronous
        // functions will stay on the message que if you change the page before the current
        // page has not finished loading. This casuses a lot of corruption in the newly loaded page
        location.reload();

        // search bar request
    } else if (searchBar.value) {
        // we grab value from the search bar, lower case and trim off any extra spaces to insure it
        // matches a key in our Database if it exists
        let key = searchBar.value;
        key = key.toLowerCase().trim()

        // we take the swapiObject we imported, our database, and grab a key if it exists
        let url = swapiDatabase[key];

        // do the same process of recording the current url before setting a new one
        if (localStorage.getItem('backLink')) {
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])
        } else {
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }

        // setting a new url to the local storage
        localStorage.setItem('newLink', url)

        // reload the page so it loads the new page
        location.reload()
    }
})


// When an api url is loaded to the infoDiv, it will create links that lead to other api urls.
// This listener will watch to see if someone clicks one of those links
infoDiv.addEventListener('click', async e => {
    // below, we make sure that the element clicked on is indeed a link
    if (e.target.classList.contains('link')) {

        // we want to prevent the default of clicking on the link, which will take the user to the swAPI page instead
        e.preventDefault()

        // same block as above, setting our history
        if (localStorage.getItem('backLink')) {
            localStorage.setItem('backLink', [localStorage.getItem('backLink'), localStorage.getItem('newLink')])
        } else {
            localStorage.setItem('backLink', [localStorage.getItem('newLink')])
        }

        // set the new url, this time we get it from the href attribute on the link element clicked on
        localStorage.setItem('newLink', e.target.href)

        // reload once again to load new page
        location.reload()
    }
})


// The listener attachted to the back button. Will take you back to your recent pages
back.addEventListener('click', e => {
    // if we have history in the local storage
    if (localStorage.getItem('backLink')) {

        // we take the history, stored as a string of links seperated by commas, and split it into an array
        let backArr = localStorage.getItem('backLink').split(',');

        // grabbing the last element (url) added to the array
        let backLast = backArr[backArr.length - 1];

        // removing the url we grabbed so that we can move further back into our history later if needed
        backArr.pop()

        // reset the history to not include the url we moved, and then set the new url
        localStorage.setItem('backLink', backArr);
        localStorage.setItem('newLink', backLast);

        // reload the page to load up the page we got from our history!!
        location.reload()
    }
})


// Will reset the page and local storage
reset.addEventListener('click', e => {
    // simply clears the local storage and reload the empty page
    localStorage.clear()
    location.reload()
})


// The function that takes a link and sends a request for data to the server using fetch
async function getResponse(link) {
    //below we fetch the passed in link, pass it through the json parsing method, and set it to response
    let response = await fetch(link).then(res => res.json())

    //set that link to the local storage incase of reload
    localStorage.setItem('newLink', link)

    //call the setInfo function with the current swAPI response object
    setInfo(response);
}


// This function is responsable for filling the HTML with the required elements to present the passed in data;
async function setInfo(apiObj) {

    // If we get a 404, instead of an error we get an object with a detail key
    // here we ask if it was a 404, and if so we create a div that lets the user know
    // there is no info at the requested location
    if (apiObj.detail) {
        let div = document.createElement('div');
        div.innerHTML = 'There is no entry at this index.'
        infoDiv.appendChild(div);
        return;
    }

    // We loop through each key in the passed in object
    for (let key in apiObj) {

        //create a div element we can fill and add to the page
        let divO = document.createElement('div');

        // here we filter out the unimportant url, created, and edited keys
        // our users dont want to see that, they want Star Wars info!
        if (key != 'url' && key != 'created' && key != 'edited') {

            // we check if the value of the current key is an array, if so, it'll be an array of links
            if (Array.isArray(apiObj[key])) {

                //we run the linkSet function on each link
                for (let newLink of apiObj[key]) {
                    await linkSet(key.toUpperCase(), newLink);
                }

            // checking if the value of the key is a single link, if so, we run that link through the linkset function
            } else if (typeof apiObj[key] == 'string' && (apiObj[key].includes('https://') || apiObj[key].includes('http://'))) {
                await linkSet(key.toUpperCase(), apiObj[key]);

            // if the value of the key is not an array or links, and not a single link, then we can
            // put that key value pair into out div
            } else {
                divO.innerHTML = `${key.toUpperCase()}:  ${apiObj[key]}`

                // add the text class so we can style each div in css
                divO.classList.add('text')

                // finally appened the div we created on to the page!
                infoDiv.appendChild(divO);
            }
        }
    }
}


//We move into this function a key has a link for a value, and we take that link and hyperlink it;
async function linkSet(key, link) {

    // this block of logic with load the link's object, grabbing the first key which will
    // be the entries name or title
    let first;
    let obj = await fetch(link).then(res => res.json())

    // we break after the first loop because we only want the first key in the object
    // remeber object[0] wont work since objects are unordered unlike arrays
    for (let key in obj) {
        first = obj[key];
        break;
    }

    // create an extra div so each anchor element is on its only line
    let div = document.createElement('div');

    // create our anchor element
    let a = document.createElement('a');

    // set the link to the anchor arrtribute, making it a hyperlink
    a.setAttribute('href', link);

    // have to add the link class so we can listen specifically fot it above
    a.classList.add('link');

    // make sure our anchor matches our regular divs by adding the css class to its parent div
    div.classList.add('text')

    // setting inner text
    a.innerHTML = `${key}:  ${first}`;

    // appeneding our anchor to our div and our div to the page!
    div.appendChild(a);
    infoDiv.appendChild(div);
}
