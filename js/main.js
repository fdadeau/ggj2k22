import Level from './level.js';

import LEVELS from './levels.js';

document.addEventListener("DOMContentLoaded", function() {
        
    let level = new Level(LEVELS[0], document.getElementById("level"));

    document.addEventListener("keydown", function(e) {
        level.processKey("down", e.code);
    }.bind(this));
    
    document.addEventListener("keyup", function(e) {
        level.processKey("up", e.code);
    }.bind(this));

    // mouse listeners 
    document.addEventListener("click", function(e) {
        if (e.target.id == "btnStart") {
            document.body.className = "level";
            level.load();
            level.reset(); 
            e.stopPropagation();
            return;   
        }
        if (e.target.id == "btnHowToPlay" || e.target.id == "btnCredits") {
            document.body.className = "howtoplay";
        }

        if (e.target.classList.contains("btnBack")) {
            document.body.className = "title";
        }
        if (document.body.classList.contains("level")) {
            level.click(e.clientX, e.clientY);
        }
    }.bind(this));

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
