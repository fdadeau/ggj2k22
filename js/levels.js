
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
    for (let i in LEVELS) {
        let score = victories[i] || 0;
        div.innerHTML += `<div class="btnLevel" data-num="${1*i+1}" data-score="${score}"></div>`;
    }
    chooseElement.appendChild(div);
    chooseElement.innerHTML += "<button class='btnBack'>Back</button>";
}


export { getLevel, levelSelection };


