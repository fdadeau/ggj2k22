

const BROADCAST_DURATION = 6000;

const SPRITE_WIDTH = 609;
const SPRITE_HEIGHT = 450;

const COLORS = { "romantic": "blue", "bad": "red", "optimistic": "yellow", "good": "green", "pessimistic": "violet", "perverse": "orange" };

const TV_WIDTH = 0.2; 
const TV_RATIO = 609/450;

export default class TV {

    constructor(resources, level, x, y) {

        this.sprite = resources["tv-spritesheet"];
        this.resources = resources;
        this.frame = 0;
        this.delayFrame = 0;

        this.broadcast = null;
        this.delay = 0;
        
        this.flip = x > 50;

        this.level = level;

        this.position = { x: x * level.width / 100 | 0, y: y * level.height / 100 | 0};
        this.ratio = level.getRatioFor(this.position.y);
        this.size = { width: level.width * TV_WIDTH | 0, height: level.width * TV_WIDTH / TV_RATIO | 0 };
        
        this.tokens = [];

        this.audio = new Audio();
        this.soul = null;
    }

    resize(oldW, oldH) {
        this.position.x = this.position.x / oldW * this.level.width;
        this.position.y = this.position.y / oldH * this.level.height;
        this.ratio = this.level.getRatioFor(this.position.y);
        this.size = { width: this.level.width * TV_WIDTH | 0, height: this.level.width * TV_WIDTH / TV_RATIO | 0 };
    }
    
    addToken(t) {
        this.tokens.push(t);
    }
    removeToken() {
        let t = this.tokens.shift();
        return t;
    }

    update(delta) {
        if (this.broadcast == null && this.tokens.length > 0) {
            this.startBroadcast(this.removeToken());
            return;
        }
        if (this.broadcast != null) {
            this.delayFrame -= delta;
            if (this.delayFrame < 0) {
                this.frame = (Math.random() * 5) | 0;
                this.delayFrame = Math.random() * 500 | 0;
            }

            if (this.soul && (this.soul.isWatching != this.broadcast)) {
                this.soul.startWatching(this.broadcast);
            }
            this.delay -= delta;
            //this.progressbar.firstChild.style.width = (percentage*100 | 0) + "%";
            if (this.delay <= 0) {
                this.stopBroadcast();
            }

        }
    }

    render(ctx) {
        let offsetY = (this.flip) ? 0 : SPRITE_HEIGHT;
        ctx.lineWidth = 1;
        ctx.stokeStyle = "black";
        ctx.drawImage(this.sprite, SPRITE_WIDTH * this.frame, offsetY, SPRITE_WIDTH, SPRITE_HEIGHT, this.position.x - this.ratio * this.size.width / 2, this.position.y - this.ratio * this.size.height / 2, this.ratio * this.size.width, this.ratio * this.size.height);
        if (this.delay > 0) {
            let percentage = 1 - (this.delay / (BROADCAST_DURATION));
            ctx.fillStyle = COLORS[this.broadcast];
            ctx.fillRect(this.position.x - this.ratio * this.size.width / 4, this.position.y - this.ratio * this.size.height * 0.6, percentage * this.ratio * this.size.width / 2, this.ratio * this.size.height / 12)
            ctx.strokeRect(this.position.x - this.ratio * this.size.width / 4, this.position.y - this.ratio * this.size.height * 0.6, this.ratio * this.size.width / 2, this.ratio * this.size.height / 12);
        }
    }

    startBroadcast(broadcast) {
        this.broadcast = broadcast;
        this.audio.src = this.resources["snd-" + this.broadcast].src;
        this.audio.play();
        this.delay = BROADCAST_DURATION;
    }
    stopBroadcast() {
        this.broadcast = null;
        this.frame = 0;
        if (this.audio) {
            this.audio.pause();
            this.audio.src = "";
        }
        if (this.tokens.length == 0 && this.soul) {
            this.soul.stopWatching();
        }
    }


    getSoulPosition() {
        let c = this.flip ? -1 : 1;
        return { x: this.position.x + this.ratio * this.size.width * 0.28 * c, y: this.position.y - this.ratio * this.size.height * 0.1 };
    }

    getDeliveryCoords() {
        let c = this.flip ? -1 : 1;
        return { x: this.position.x - this.ratio * this.size.width * 0.37 * c, y: this.position.y - this.ratio * this.size.height * 1.1 };
    }

    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < this.ratio * this.size.height*this.ratio * this.size.height*0.4;
    }
    
}