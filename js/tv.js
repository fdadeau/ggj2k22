
const TV_SIZE = { width: 220, height: 160 };

const BROADCAST_DURATION = 12;

export default class TV {

    constructor(kind, x, y) {
        this.element = document.createElement("div");
        this.element.className = "tv";
        
        this.element.style = `--sprite-width: ${TV_SIZE.width}px; --sprite-height: ${TV_SIZE.height}px;`;
        this.element.style.top = y + "px";
        this.element.style.left = x + "px";

        if (x > window.innerWidth / 2) {
            this.element.classList.add("flip");
        }

        this.kind = kind.split("_");
        this.element.dataset.kind = kind;

        this.broadcast = null;
        this.delay = 0;

        this.position = { x: x, y: y };
        this.tokens = [];

        this.audio = new Audio();
        this.audio.loop = true;

        this.soul = null;
    }

    addTokens(list) {
        let before = this.tokens.length;
        for (let t of list) {
            if (this.kind[0] == t || t == this.kind[1]) {
                this.tokens.push(t);
            }
        }
        if (this.tokens.length > before) {
            this.render();
        }
    }

    update(delta) {
        if (this.broadcast == null && this.tokens.length > 0) {
            this.broadcast = this.tokens.shift();
            this.audio.src = "../sounds/" + this.broadcast + ".wav";
            this.audio.play();
            this.render();
            this.element.classList.add(this.broadcast);
            this.delay = BROADCAST_DURATION * 1000;
            return;
        }
        if (this.broadcast != null) {
            if (this.soul && (this.soul.isWatching != this.broadcast)) {
                this.soul.startWatching(this.broadcast);
            }
            this.delay -= delta;
            if (this.delay < 0) {
                this.element.classList.remove(this.broadcast);
                this.broadcast = null;
                this.audio.pause();
                if (this.tokens.length == 0 && this.soul) {
                    this.soul.stopWatching();
                }
            }

        }
    }


    getSoulPosition() {
        let c = this.element.classList.contains("flip") ? -1 : 1;
        return { x: this.position.x + TV_SIZE.width * 0.28 * c, y: this.position.y - TV_SIZE.height * 0.1 };
    }

    collides(x, y, w, h) {
        return false;
    }

    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < TV_SIZE.height*TV_SIZE.height*0.5;
    }

    render() {
        this.element.innerHTML = this.tokens.map(t => `<div class="dual ${t}"></div>`).join("");
    }

    
}