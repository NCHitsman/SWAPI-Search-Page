
// *** DO NOT RUN! ONLY NEEDED TO BE RUN ONCE TO CREATE THE OBJECT FOUND IN swapiObject.js

const fetch = require('node-fetch')
const fs = require('fs')

let fullObj = {}

const creator = async () => {
    let cats = ['people', 'films', 'vehicles', 'species', 'starships', 'planets']
    for (let category of cats) {
        let counter = 0;
        for (let i = 1; i < Infinity; i++) {
            let currentObj = await fetch(`https://swapi.dev/api/${category}/${i}/`)
                .then(a => {
                    if (a.ok) {
                        return a.json()
                    } else {
                        throw new Error
                    }
                }).catch(() => false)
            if (currentObj) {
                counter = 0;
                let name;
                for (let key in currentObj) {
                    name = currentObj[key].toLowerCase().trim();
                    break;
                }
                fullObj[name] = `https://swapi.dev/api/${category}/${i}/`;
                console.log(name, `https://swapi.dev/api/${category}/${i}/`)
            } else {
                counter++
                if (counter == 15) {
                    break;
                }
            }
        }
    }
    setTimeout(() => {
        fs.writeFile('swapiObject.json', JSON.stringify(fullObj), 'utf-8', (err) => {
            if(err) {
                console.log(err)
            } else {
                console.log('finish writing')
            }
        })
    } ,0)
}

creator()
