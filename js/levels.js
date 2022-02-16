
const LEVELS = [];

const LEVEL0 = {
    time: 60,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 6000,
    tokens: ["optimistic"],
    goal: [ ["optimistic"] ],
    score: [60, 40, 20]
}
LEVELS.push(LEVEL0);
const LEVEL1 = {
    time: 90,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 3000,
    tokens: ["optimistic", "good", "perverse", "bad", "pessimistic", "romantic"],
    goal: [ ["good", "perverse"], ],
    score: [90, 60, 40]
}
LEVELS.push(LEVEL1);
const LEVEL2 = {
    time: 120,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 3000,
    tokens: ["good", "perverse", "bad", "romantic"],
    goal: [ ["romantic", "good", "good"], ["bad"] ],
    score: [120, 90, 60]
}
LEVELS.push(LEVEL2);
const LEVEL3 = {
    time: 150,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 3000,
    tokens: ["optimistic", "good", "perverse", "bad", "pessimistic", "romantic"],
    goal: [ ["optimistic", "good"], ["perverse", "pessimistic"], ],
    score: [150, 120, 60]
}
LEVELS.push(LEVEL3);
const LEVEL4 = {
    time: 150,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 3000,
    tokens: ["optimistic", "good", "perverse", "bad", "pessimistic", "romantic"],
    goal: [ ["optimistic", "good", "perverse", "perverse"], ["pessimistic"] ],
    score: [150, 120, 60]
}
LEVELS.push(LEVEL4);
const LEVEL5 = {
    time: 160,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 3000,
    tokens: ["optimistic", "good", "perverse", "pessimistic", "romantic"],
    goal: [ ["optimistic", "optimistic"], ["perverse", "perverse"], ["romantic" , "romantic"] ],
    score: [160, 120, 80]
}
LEVELS.push(LEVEL5);
const LEVEL6 = {
    time: 150,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 2500,
    tokens: ["optimistic", "good", "perverse", "pessimistic", "romantic","bad"],
    goal: [ ["optimistic", "romantic"], ["perverse", "good"], ["bad" , "pessimistic"] ],
    score: [150, 100, 80]
}
LEVELS.push(LEVEL6);
const LEVEL7 = {
    time: 150,
    TVs: [ { x: 40, y: 40 },
           { x: 14, y: 75 }, 
           { x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    delay: 2000,
    tokens: ["optimistic", "good", "perverse", "pessimistic", "romantic", "bad"],
    goal: [ ["bad", "good"], ["perverse", "perverse", "optimistic"], ["bad"], ["romantic"] ],
    score: [150, 100, 70]
}
LEVELS.push(LEVEL7);









// Exported API

function getLevel(n) {
    return (n >= 0 && n < LEVELS.length) ? LEVELS[n] : null;
}


function levelSelection(chooseElement, victories) {
    chooseElement.innerHTML = "<h2>Choose level</h2>";
    let div = document.createElement("div");
    console.log(victories);
    for (let i in LEVELS) {
        let num = 1*i+1;
        let score = victories[num] || 0;
        div.innerHTML += `<div class="btnLevel" data-num="${num}" data-score="${score}"></div>`;
    }
    chooseElement.appendChild(div);
    chooseElement.innerHTML += "<button class='btnBack'>Back</button>";
}


export { getLevel, levelSelection };


