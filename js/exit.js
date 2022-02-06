const EXIT_SIZE = { width: 120, height: 60 };



export default class Exit {

    constructor(x, y) {
        this.element = document.createElement("div");
        this.element.id = "exit";
        this.element.style = `--sprite-width: ${EXIT_SIZE.width}px; --sprite-height: ${EXIT_SIZE.height}px;`;
        this.element.style.top = (y | 0) + "px";
        this.element.style.left = (x | 0) + "px";
        this.position = { x: x, y: y };
        this.audio = new Audio();
        this.audio.loop = false; 
    }

    deliver(soul) {
        this.element.innerHTML = "";
        this.element.appendChild(soul.element);
    }

    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < EXIT_SIZE.width*EXIT_SIZE.width*0.5;
    }

    play(ok) {
        this.audio.src = ok ? "./sounds/Tombe1-Bon.wav" : "./sounds/Tombe1-Mauvais.wav"; 
        this.audio.play();
    }

}