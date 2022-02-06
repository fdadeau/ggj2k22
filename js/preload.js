/***
 * Preload of resource files 
 */

const data = {
    "background": "./images/nuagefond.png", 
    "grille": "./images/grille.png",
    "icones": "./images/icones.png"
}

async function preload() {
    let r = {};
    for (let i in data) {
        r[i] = await loadImage(data[i]);
    }
    return r;
}

function loadImage(path) {
    return new Promise(function(resolve, reject) {
        let img = new Image();
        img.onload = function() {
            resolve(this);
        }
        img.onerror = function() {
            reject(this);
        }
        img.src = path;
    });
}

export default preload;