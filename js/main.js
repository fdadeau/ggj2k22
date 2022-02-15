import Level from './level.js';

import { getLevel, levelSelection } from './levels.js';

import { preload, data } from "./preload.js";

const STORAGE_KEY = "victories";

document.addEventListener("DOMContentLoaded", async function() {
     
    /*** 
     *      GAME MANAGEMENT DATA 
     */
    let currentLevel = -1;  // index in LEVELS array
    let level = null;       // shortcut to the level object itself
    
    let resources = null;

    // disable right-click
    document.oncontextmenu = function() { return false; };
    document.ondblclick = function() { return false; };

    // preloading... (async)
    try {
        resources = await preload(data, document.querySelector("#preload > div"));
        prepareTitleScreen();

        //currentLevel = 1;
        //loadCurrentLevel();
        //show("level");
    }
    catch (err) {
        console.log(err);
        return;
    }


    // keyboard listeners 
    document.addEventListener("keydown", function(e) {
        level.processKey("down", e.code);
    });
    document.addEventListener("keyup", function(e) {
        level.processKey("up", e.code);
    });

    // screen listener 
    window.addEventListener("resize", function(e) {
        if (level) {
            level.resize();
            level.render();
        }
    });

    // mouse listeners 
    document.addEventListener("click", function(e) {
        e.stopPropagation();
        /**
         *  ...on the "preload" page
         */
        if (e.target.id == "btnReady") {    // available once assets have been loaded
            document.body.requestFullscreen();
            show("title");
            return;
        }
        /**
         *  ...on the "title" page
         */
         if (e.target.id == "btnStart") {    // --> opens level selection page
            show("choose")
            return;   
        }
        if (e.target.id == "btnHowToPlay") {    // --> opens information page on how to play
            show("howtoplay");
            return;
        }
        if (e.target.id == "btnCredits") {      // --> opens credit page
            show("credits");
            return;
        }

        /**
         *  ...on the "gameover" screen
         */
        if (e.target.id == "btnBackToMenu") {
            document.getElementById("gameover").style.display = "none";
            show("choose");
            return;
        }
        if (e.target.id == "btnResume") {
            document.getElementById("gameover").style.display = "none";
            level.over = false;
            return;
        }
        if (e.target.id == "btnNext") {
            document.getElementById("gameover").style.display = "none";
            if (getLevel(currentLevel+1)) {
                currentLevel++;
                loadCurrentLevel();
            }
            else {
                show("choose");
            }
            return;
        }
        if (e.target.id == "btnRestart") {
            document.getElementById("gameover").style.display = "none";
            loadCurrentLevel();
            return;
        }

        /**
         *  ...on the "level selection" screen
         */
         if (e.target.classList.contains("btnLevel")) {
            currentLevel = Number(e.target.dataset.num) - 1;
            loadCurrentLevel();
            show("level");
            return;
        }

        // on various screens
        if (e.target.classList.contains("btnBack")) {
            show("title");
            return;
        }

        // on the game screen
        if (e.target.id == "btnStartLevel") {
            e.target.style.display = "none";
            level.reset();
            return;
        }

        if (document.body.classList.contains("level")) {
            level.click(e.clientX, e.clientY);
            return;
        }
    });

    // Menus management 
    function show(which) {
        if (which == "choose") {
            let victories = localStorage.getItem(STORAGE_KEY) || "{}";
            victories = JSON.parse(victories);
            levelSelection(document.getElementById("choose"), victories);
        }
        // fade effect
        document.body.style.opacity = 0;
        setTimeout(function() {
            document.body.className = which;
            document.body.style.opacity = 1;
        }, 1000);
    }

    function prepareTitleScreen() {
        // add images to title screen
        let titleScreen = document.getElementById("title");
        titleScreen.insertBefore(resources["tv-titre"], titleScreen.firstChild);
        titleScreen.insertBefore(resources["demonio-titre"], titleScreen.firstChild);
        titleScreen.insertBefore(resources["titre2"], titleScreen.firstChild);
        titleScreen.insertBefore(resources["titre1"], titleScreen.firstChild);

        // display run button
        let btnReady = document.createElement("button");
        btnReady.innerHTML = "Run!";
        btnReady.id = "btnReady";
        document.getElementById("preload").appendChild(btnReady);
    }

    function loadCurrentLevel() {
        document.getElementById("level").innerHTML = "";
        level = new Level(getLevel(currentLevel), document.getElementById("level"), resources, gameover);
       // level.reset();
    }

    function gameover(b, score) {
        if (b === true) {
            let vic = localStorage.getItem(STORAGE_KEY) || "{}";
            vic = JSON.parse(vic);
            if (!vic[String(currentLevel+1)] || vic[String(currentLevel+1)] < score) {
                vic[String(currentLevel+1)] = score;
            }
            localStorage.setItem("victories", JSON.stringify(vic));
        }
        let go = document.getElementById("gameover");
        if (score !== undefined) {
            go.dataset.score = score;
        }
        else {
            go.removeAttribute("data-score");
        }
        go.style.display = "block";
    }

    // Game loop
    let last = Date.now();    
    function mainloop() {
        requestAnimationFrame(mainloop);
        let now = Date.now();
        let delta = now-last;
        if (!level.over) {
            level.update(delta) && level.render();
        }
        last = now;
    }
    mainloop();
});
