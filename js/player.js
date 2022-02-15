
const PLAYER_SPEED = 0.4;

const SPRITE_WIDTH = 401;
const SPRITE_HEIGHT = 415;

const PLAYER_WIDTH = 0.12; // percentage of screen width
const PLAYER_RATIO = SPRITE_WIDTH / SPRITE_HEIGHT;

const DELTA_TURN = 0.025;

export default class Player {

    constructor(resources, level, startX, startY) {

        // pointer to upper structure
        this.level = level;

        // position == middle + center
        this.position = { x: startX * level.width / 100, y: startY * level.height / 100, dir: 0 };
        this.movement = { x: 0, y: 0 };
        this.speed = PLAYER_SPEED;
        
        this.size = { width : PLAYER_WIDTH * level.width | 0, height: PLAYER_WIDTH * level.width / PLAYER_RATIO | 0 };
        this.offset = 0;
        this.offsetY = 0;
        this.ratio = this.level.getRatioFor(this.position.y);
        // rendering
        this.sprite = resources["demonio-spritesheet"];

        this.delay = 0; 
        
        // carried soul
        this.soul = null;
    }

    resize(oldW, oldH) {
        this.position.x = this.position.x / oldW * this.level.width;
        this.position.y = this.position.y / oldH * this.level.height;
        this.size = { width : PLAYER_WIDTH * this.level.width | 0, height: PLAYER_WIDTH * this.level.width / PLAYER_RATIO | 0 };
        this.ratio = this.level.getRatioFor(this.position.y);
    }

    update(delta) {
        this.offset = (this.offset + DELTA_TURN) % 2;
        this.offsetY =  Math.sin(this.offset*Math.PI) * 10;

        if (this.delay > 0) {
            this.delay -= delta;
            return;
        }
        if (this.movement.x !== 0 || this.movement.y !== 0) {
            let newX = this.position.x + this.speed * delta * this.movement.x; 
            let newY = this.position.y + this.speed*0.7 * delta * this.movement.y; 

            if (! this.level.collides(newX, newY, this.size.width * this.ratio, this.size.height * this.ratio)) {
                this.position.x = newX;
                this.position.y = newY;
            }
            else if (! this.level.collides(this.position.x, newY, this.size.width * this.ratio, this.size.height * this.ratio)) {
                this.position.y = newY;
            }
            else if (! this.level.collides(newX, this.position.y, this.size.width * this.ratio, this.size.height * this.ratio)) {
                this.position.x = newX;
            }
            else {
                return;
            }
            
            this.ratio = this.level.getRatioFor(this.position.y);
        }
    }

    render(ctx) {
        let offsetX = (this.position.dir > 0) ? 0 : SPRITE_WIDTH;
        offsetX += (this.soul) ? SPRITE_WIDTH*2 : 0;
        ctx.drawImage(this.sprite, offsetX, 0, SPRITE_WIDTH, SPRITE_HEIGHT, this.position.x - this.size.width * this.ratio / 2 | 0, this.position.y - this.offsetY * this.ratio - this.size.height * this.ratio | 0, this.size.width * this.ratio | 0, this.size.height * this.ratio | 0);
        if (this.soul) {
            let c = this.position.dir > 0 ? -1 : 1;
            this.soul.displayCaracteristicsAt(ctx, this.position.x - c * (this.size.width * this.ratio / 5), this.position.y - this.ratio * this.size.height / 5 - this.offsetY * this.ratio, this.ratio);
        }
    }



    /**** Game actions ****/
    dropSoul() {
        if (this.soul) {
            this.soul.drop(this.position.x, this.position.y);
        }
        this.soul = null;
        this.level.element.classList.remove("withSoul");
    }
    pickupSoul(soul) {
        this.soul = soul;
        soul.pickup();
        this.level.element.classList.add("withSoul");
    }

    setOrientation(x) {
        if (this.movement.x == 0 && this.movement.y == 0) {
            this.position.dir = x;
        }
    }
    
    // processing of keyboard events
    processKey(upOrDown, code) {
        if (upOrDown == "down") {
            switch (code) {
                case 'ArrowLeft': 
                case 'KeyA':
                    this.movement.x = -1;
                    this.position.dir = -1;
                    break;
                case 'ArrowRight': 
                case 'KeyD':
                    this.movement.x = 1;
                    this.position.dir = 1;                    
                    break;
                case 'ArrowUp': 
                case 'KeyW':
                    this.movement.y = -1;
                    break;
                case 'ArrowDown': 
                case 'KeyS':
                    this.movement.y = 1;
                    break;
            }
        }
        else {
            switch (code) {
                case 'ArrowLeft': 
                case 'KeyA':
                    if (this.movement.x == -1) {
                        this.movement.x = 0;
                    }
                    break;
                case 'ArrowRight': 
                case 'KeyD':
                    if (this.movement.x == 1) {
                        this.movement.x = 0;
                    }
                    break;
                case 'ArrowUp': 
                case 'KeyW':
                    if (this.movement.y == -1) {
                        this.movement.y = 0;
                    }
                    break;
                case 'ArrowDown': 
                case 'KeyS':
                    if (this.movement.y == 1) {
                        this.movement.y = 0;
                    }
                    break;
            }
        }
    }



}
