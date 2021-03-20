
// *** DO NOT RUN! ONLY NEEDED TO BE RUN ONCE TO CREATE THE OBJECT FOUND IN swapiObject.js

const fetch = require('node-fetch')
const fs = require('fs')

let fullObj = {}

const creator = async () => {
    let cats = ['people', 'films', 'vehicles', 'species', 'starships', 'planets']
    let fetchPromises = [];
    for (let category of cats) {
        let counter = 0;
        for (let i = 1; i < 15; i++) {
            const fetching = fetch(`https://swapi.dev/api/${category}/${i}/`)
                .then(a => {
                    if (a.ok) {
                        return a.json()
                    } else {
                        throw new Error
                    }
                })
                .then(currentObj => {
                    if (currentObj) {
                        counter = 0;
                        let name;
                        for (let key in currentObj) {
                            name = currentObj[key].toLowerCase().trim();
                            break;
                        }
                        fullObj[name] = `https://swapi.dev/api/${category}/${i}/`;
                        console.log(name, `https://swapi.dev/api/${category}/${i}/`)
                    }
                })
                .catch(() => false);
            fetchPromises.push(fetching);

        }
    }
    Promise.all(fetchPromises)
        .then(() => {
            fs.writeFile('swapiObject.json', JSON.stringify(fullObj), 'utf-8', (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('finish writing')
                }
            })
        });
}

creator()
