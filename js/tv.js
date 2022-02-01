
const TV_SIZE = { width: 220, height: 160 };

const BROADCAST_DURATION = 11000;

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

        this.progressbar = document.createElement("div");
        this.progressbar.className = "progressbar";
        this.progressbar.appendChild(document.createElement("div"));
        this.element.appendChild(this.progressbar);

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
        for (let t of list) {
            if (this.kind[0] == t || t == this.kind[1]) {
                this.addToken(t);
            }
        }
    }
    addToken(t) {
        this.tokens.push(t);
        let tElt = document.createElement("div");
        tElt.className = "dual " + t;
        this.element.appendChild(tElt);
    }
    removeToken() {
        let t = this.tokens.shift();
        this.element.removeChild(this.element.querySelector(".dual"));
        return t;
    }

    update(delta) {
        if (this.broadcast == null && this.tokens.length > 0) {
            this.startBroadcast(this.removeToken());
            return;
        }
        if (this.broadcast != null) {
            if (this.soul && (this.soul.isWatching != this.broadcast)) {
                this.soul.startWatching(this.broadcast);
            }
            this.delay -= delta;
            let percentage = 1 - (this.delay / (BROADCAST_DURATION));
            this.progressbar.firstChild.style.width = (percentage*100 | 0) + "%";
            if (this.delay <= 0) {
                this.stopBroadcast();
            }

        }
    }

    startBroadcast(broadcast) {
        this.broadcast = broadcast;
        this.audio.src = "./sounds/" + this.broadcast + ".wav";
        this.audio.play();
        this.element.classList.add(this.broadcast);
        this.delay = BROADCAST_DURATION;
    }
    stopBroadcast() {
        this.element.classList.remove(this.broadcast);
        this.broadcast = null;
        this.audio.pause();
        if (this.tokens.length == 0 && this.soul) {
            this.soul.stopWatching();
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
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < TV_SIZE.height*TV_SIZE.height*0.4;
    }
    
}