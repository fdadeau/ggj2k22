

const SPRITE_WIDTH = 2216/8;
const SPRITE_HEIGHT = 713;
const DELAY = 300;

const GRID_WIDTH = 0.09;
const GRID_RATIO = 2;

const PANEL_WIDTH = 0.08;
const PANEL_RATIO = 2.3;

const CROP_SPEED = 0.01;

export default class Exit {

    constructor(resources, level, x, y) {
        this.position = { x: x * level.width / 100, y: y * level.height / 100 };
        this.resources = resources;
        this.audio = null
        this.imgGrille = resources["grille"];
        this.gridSize = { width: level.width * GRID_WIDTH | 0, height: level.width * GRID_WIDTH / GRID_RATIO | 0 };
        this.imgPanneau = resources["panneau-spritesheet"];
        this.panelSize = { width: level.width * PANEL_WIDTH | 0, height: level.width * PANEL_WIDTH * PANEL_RATIO | 0 };
        this.delay = DELAY;
        this.frame = 0;
        this.crop = 0;
        this.soul = null;
        this.level = level;
        this.ratio = level.getRatioFor(this.position.y);
    }

    resize(oldW, oldH) {
        this.position.x = this.position.x / oldW * this.level.width;
        this.position.y = this.position.y / oldH * this.level.height;
        this.ratio = this.level.getRatioFor(this.position.y);
        this.gridSize = { width: this.level.width * GRID_WIDTH | 0, height: this.level.width * GRID_WIDTH / GRID_RATIO | 0 };
        this.panelSize = { width: this.level.width * PANEL_WIDTH | 0, height: this.level.width * PANEL_WIDTH * PANEL_RATIO | 0 };
    }

    deliver(soul) {
        this.soul = soul;
        this.crop = 0;
    }

    update(delta) {
        this.delay -= delta;
        if (this.delay < 0) {
            this.delay += DELAY;
            this.frame = (this.frame + 1) % 8;
        }
        if (this.soul) {
            this.crop += CROP_SPEED;
            if (this.crop >= 1) {
                this.soul = null;
                this.crop = 0;
            }
        }
    }

    render(ctx) {
        ctx.drawImage(this.imgGrille, this.position.x - this.gridSize.width * this.ratio / 2, this.position.y - this.gridSize.height * this.ratio / 2, this.gridSize.width * this.ratio, this.gridSize.height * this.ratio);
        ctx.drawImage(this.imgPanneau, this.frame * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT, this.position.x - this.panelSize.width * this.ratio / 2 + this.gridSize.width * this.ratio / 8, this.position.y - this.panelSize.height * this.ratio - this.gridSize.height * this.ratio / 4, this.panelSize.width * this.ratio, this.panelSize.height * this.ratio);
        if (this.soul) {
            this.soul.displayAt(ctx, this.position.x, this.position.y, this.level.getRatioFor(this.soul.position.y), this.crop);
        }
    }


    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < this.gridSize.width*this.gridSize.width*0.5;
    }

    play(ok) {
        this.audio = ok ? this.resources["snd-tombe-ok"] : this.resources["snd-tombe-ko"]; 
        this.audio.loop = false; 
        this.audio.play();
    }

}