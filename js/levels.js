
const LEVELS = [];

const LEVEL0 = {
    time: 60,
    TVs: [ { kind: "romantic_perverse", x: 40, y: 40 },
           { kind: "good_bad", x: 14, y: 75 }, 
           { kind: "optimistic_pessimistic", x: 80, y: 70 }
        ],
    player: { x: 50, y: 55 },
    source: { x: 10, y: 60 },
    exit: { x: 80, y: 40 },
    goal: [ [] ],
    score: [60, 40, 20]
}
LEVELS.push(LEVEL0);
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
    score: [180, 120, 60]
}
LEVELS.push(LEVEL1);
LEVELS.push(LEVEL1);
LEVELS.push(LEVEL1);
LEVELS.push(LEVEL1);
LEVELS.push(LEVEL1);


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


