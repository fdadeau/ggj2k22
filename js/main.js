import Level from './level.js';

document.addEventListener("DOMContentLoaded", function() {
        
    let level = new Level(LEVEL1, document.getElementById("level"));

    document.addEventListener("keydown", function(e) {
        level.processKey("down", e.code);
    }.bind(this));
    
    document.addEventListener("keyup", function(e) {
        level.processKey("up", e.code);
    }.bind(this));

    // mouse listeners 
    document.addEventListener("click", function(e) {
        level.click(e.clientX, e.clientY);
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


const LEVEL1 = {
    time: 180,
    TVs: [ { kind: "romantic_perverse", x: 40, y: 40 },
           { kind: "good_bad", x: 14, y: 75 }, 
           { kind: "optimistic_pessimistic", x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    goal: [ ["optimistic", "good", "perverse", "perverse"], [] ],
}


    