

const SOUL_STATE = { CARRIED: "carried", ON_THE_FLOOR: "on_the_floor", WATCHING_TV: "watching_tv", COMPLETED: "completed" };

const SOUL_TIME = 4;   // in seconds

const SOUL_WIDTH = 0.065;
const SOUL_RATIO = 1;

const SPRITE_WIDTH = 350;
const SPRITE_HEIGHT = 350;

const COLORS = { "romantic": "blue", "bad": "red", "optimistic": "yellow", "good": "green", "pessimistic": "violet", "perverse": "orange" };
const OFFSET = { green: 0, blue: 202, red: 404, violet: 606, orange: 808, yellow: 1010 };

const FRAMES = { 
    "romantic": [0, 1, 2, 3, 14, 15], 
    "bad": [0, 1, 2, 3, 10, 11], 
    "good": [0, 1, 2, 3, 8, 9], 
    "pessimistic": [0, 1, 2, 3, 12, 13], 
    "optimistic": [0, 1, 2, 3, 6, 7], 
    "perverse": [0, 1, 2, 3, 4, 5]
}
const NB_FRAMES = 6;
const FRAME_DELAY = 700;

export default class Soul {

    constructor(resources, level) {
        this.tv = null;
        this.time = 0;
        this.caracteristics = [];
        this.state = SOUL_STATE.CARRIED;
        this.isWatching = null;
        this.sprite = resources["soul-spritesheet"];
        this.imgIcones = resources["tokens-spritesheet"];
        this.frame = 0;
        this.frameDelay = 0;
        this.level = level;
        this.size = { width: this.level.width * SOUL_WIDTH | 0, height: this.level.width * SOUL_WIDTH / SOUL_RATIO | 0 };
    }  

    /**** Game actions ****/

    bindToTv(tv) {
        this.tv = tv;
        tv.soul = this;
        this.position = tv.getSoulPosition();
        this.state = SOUL_STATE.WATCHING_TV;
    }
    takeFromTv() {
        this.state = SOUL_STATE.CARRIED;
        this.tv.soul = null;
        this.tv = null;
        this.isWatching = null;
    }
    drop(x, y) {
        this.state = SOUL_STATE.ON_THE_FLOOR;
        this.position = { x: x, y: y };
    }
    pickup() {
        this.state = SOUL_STATE.CARRIED;
        if (this.tv) {
            this.tv.soul = null;
            this.tv = null;
            this.isWatching = null;
        }
    }

    startWatching(broadcast) {
        this.isWatching = broadcast;
        this.delay = SOUL_TIME * 1000;
        this.frameDelay = FRAME_DELAY;
    }
    stopWatching() {
        this.isWatching = null;
        this.delay = 0;
    }

    isClose(x, y) {
        return (this.state == SOUL_STATE.WATCHING_TV || this.state == SOUL_STATE.ON_THE_FLOOR) && (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < this.size.width*this.size.width;
    }

    increase(caract) {
        this.caracteristics.push(caract);
        this.caracteristics.sort();
    }

    update(delta) {
        if (this.isWatching) {
            this.delay -= delta;
            if (this.delay < 0) {
                this.increase(this.isWatching);
                this.delay = SOUL_TIME * 1000;
            }
            this.frameDelay -= delta;
            if (this.frameDelay <= 0) {
                if (this.frame < NB_FRAMES - 1) {
                    this.frame++;
                }
                this.frameDelay = FRAME_DELAY;
            }
        }
        else {
            this.frame = 0;
        }
    }

    render(ctx) {
        if (this.state == SOUL_STATE.CARRIED) {
            return;
        }
        this.displayAt(ctx, this.position.x, this.position.y, this.level.getRatioFor(this.position.y));
    }

    displayAt(ctx, x, y, ratio, crop) {
        ctx.save();
        ctx.translate(x, y);
        let c = 1;
        if (this.tv && this.tv.flip) {
            ctx.scale(-1, 1);
        }
        if (!crop) {
            crop = 0;
        }
        let f = (this.isWatching) ? FRAMES[this.isWatching][this.frame] : 0;
        ctx.drawImage(this.sprite, f * SPRITE_WIDTH, 0, SPRITE_WIDTH, (1-crop) * SPRITE_HEIGHT,  - ratio * this.size.width / 2 | 0, - (1-crop) * ratio * this.size.height | 0, ratio * this.size.width | 0, (1 - crop) * ratio * this.size.height | 0);
        ctx.restore();
        if (!crop) {
            this.displayCaracteristicsAt(ctx, x, y, ratio);
        }
    }

    displayCaracteristicsAt(ctx, x, y, ratio) {
        let size = ratio * this.size.width / 4.5 | 0;
        let startX = x - (this.caracteristics.length / 2) * (size + 2);
        for (let i=0; i < this.caracteristics.length; i++) {
            let offsetX = OFFSET[COLORS[this.caracteristics[i]]];
            ctx.drawImage(this.imgIcones, offsetX, 0, 202, 203, startX + i * (size + 2) | 0, y - ratio * this.size.height | 0, size | 0, size | 0); 
        }
    }

}