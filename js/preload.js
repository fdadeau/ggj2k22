/** Data to preload */
const data = {
    "background": "./images/nuagefond.png", 
    
    // title screen images
    "titre1": "./images/titre1.png",
    "titre2": "./images/titre2.png",
    "demonio-titre": "./images/demonio-titre.png",
    "tv-titre": "./images/tv-titre.png",
    
    // spritesheets
    "demonio-spritesheet": "./images/demonio-spritesheet.png",
    "tv-spritesheet": "./images/tv-spritesheet.png",
    "angie-spritesheet": "./images/angie-spritesheet.png",
    "succubia-spritesheet": "./images/succubia-spritesheet.png",
    "tokens-spritesheet": "./images/tokens-spritesheet.png",
    "aureole-spritesheet": "./images/aureole-spritesheet.png",
    "panneau-spritesheet": "./images/panneau-spritesheet.png",
    "soul-spritesheet": "./images/soul-spritesheet.png",
    "robinet-spritesheet": "./images/robinet-spritesheet.png",
    // game elements
    "grille": "./images/grille.png",
    "coche-verte": "./images/coche-verte.png",
    // sounds 
    "snd-perverse": "./sounds/perverse.wav",
    "snd-optimistic": "./sounds/optimistic.wav",
    "snd-pessimistic": "./sounds/pessimistic.wav",
    "snd-romantic": "./sounds/romantic.wav",
    "snd-good": "./sounds/good.wav",
    "snd-bad": "./sounds/bad.wav",
    "snd-tombe-ok": "./sounds/Tombe1-Bon.wav",
    "snd-tombe-ko": "./sounds/Tombe1-Mauvais.wav",
    "snd-robinet": "./sounds/Robinet.wav",
    "snd-coup": "./sounds/coup.mp3"
}


/***
 * Preload of resource files (images/sounds) 
 */
async function preload(data, elt) {
    elt.dataset.total = Object.keys(data).length;
    elt.dataset.loaded = 0;
    let r = {};
    for (let i in data) {
        if (data[i].endsWith(".png") || data[i].endsWith(".jpg")) {
            r[i] = await loadImage(data[i]);
        }
        else {
            r[i] = await loadSound(data[i]);
        }
        elt.dataset.loaded = Number(elt.dataset.loaded) + 1;
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

function loadSound(path) {
    return new Promise(function(resolve, reject) {
        let audio = new Audio();
        audio.oncanplaythrough = function() {
            resolve(this);
        }
        audio.onerror = function() {
            reject(this);
        }
        audio.src = path;
    });    
}

export { preload, data };