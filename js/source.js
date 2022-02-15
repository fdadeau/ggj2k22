

const ANIM_DURATION = 2000;
const NB_FRAMES = 18;

const SPRITE_HEIGHT = 602;
const SPRITE_WIDTH = 402;

const SOURCE_RATIO = SPRITE_WIDTH / SPRITE_HEIGHT;
const SOURCE_WIDTH = 0.13;

export default class Source {

    constructor(resources, level, x, y) {
        this.position = { x: x * level.width / 100, y: y * level.height / 100 };
        this.size = { width: SOURCE_WIDTH * level.width, height: SOURCE_WIDTH * level.width / SOURCE_RATIO };
        this.audio = resources["snd-robinet"];
        this.sprite = resources["robinet-spritesheet"];
        this.level = level;
        this.animation = 0;
        this.frame = 0;
    }

    resize(oldW, oldH) {
        this.position.x = this.position.x / oldW * this.level.width;
        this.position.y = this.position.y / oldH * this.level.height;
        this.size = { width: SOURCE_WIDTH * this.level.width, height: SOURCE_WIDTH * this.level.width / SOURCE_RATIO };    
    }

    collides(x, y, w, h) {
        return !(
            x + w/2 < this.position.x - this.size.width / 10 ||
            x - w/2 > this.position.x + this.size.width / 10 ||
            y > this.position.y ||
            y < this.position.y - this.size.height / 5
        );
    }

    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < this.size.width*this.size.width/2;
    }

    activate() {
        this.animation = 1;
    }

    update(delta) {
        if (this.animation > 0) {
            this.animation += delta;
            if (this.animation > ANIM_DURATION) {
                this.animation = 0;
            }
        }
    }

    render(ctx) {
        let frame = this.animation / (ANIM_DURATION / NB_FRAMES) | 0;
        ctx.drawImage(this.sprite, frame * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT, this.position.x - this.size.width / 2 | 0, this.position.y - this.size.height | 0, this.size.width, this.size.height);
    }

}