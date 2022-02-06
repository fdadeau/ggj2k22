import Level from './level.js';

import { getLevel, levelSelection } from './levels.js';

import preload from "./preload.js";

const STORAGE_KEY = "victories";

document.addEventListener("DOMContentLoaded", async function() {
        
    document.oncontextmenu= function() { return false; };

    try {
        const resources = await preload();
    }
    catch (err) {
        console.log(err);
        return;
    }

    let currentLevel = -1;

    let level = new Level(getLevel(0), document.getElementById("level"));

    document.addEventListener("keydown", function(e) {
        level.processKey("down", e.code);
    });
    
    document.addEventListener("keyup", function(e) {
        level.processKey("up", e.code);
    });

    // mouse listeners 
    document.addEventListener("click", function(e) {
        e.stopPropagation();
        if (e.target.id == "btnStart") {
            show("choose")
            return;   
        }
        if (e.target.id == "btnHowToPlay") {
            show("howtoplay");
            return;
        }
        if (e.target.id == "btnCredits") {
            show("credits");
            return;
        }

        // game over buttons
        if (e.target.id == "btnBackToMenu") {
            document.getElementById("gameover").style.display = "none";
            show("choose");
            return;
        }
        if (e.target.id == "btnRestart") {
            document.getElementById("gameover").style.display = "none";
            loadCurrentLevel();
            return;
        }

        if (e.target.classList.contains("btnBack")) {
            show("title");
            return;
        }
        if (e.target.classList.contains("btnLevel")) {
            currentLevel = Number(e.target.dataset.num) - 1;
            loadCurrentLevel();
            show("level");
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
        document.body.className = which;
    }

    function loadCurrentLevel() {
        level = new Level(getLevel(currentLevel), document.getElementById("level"), gameover);
        level.load();
        level.reset();
    }

    function gameover(b, score) {
        if (b) {
            let vic = localStorage.getItem(STORAGE_KEY) || "{}";
            vic = JSON.parse(vic);
            if (!vic[String(currentLevel+1)] || vic[String(currentLevel+1)] < score) {
                vic[String(currentLevel+1)] = score;
            }
            localStorage.setItem("victories", JSON.stringify(vic));
        }
        let go = document.getElementById("gameover");
        go.dataset.score = score;
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
