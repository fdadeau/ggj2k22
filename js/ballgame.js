/***
 *  2nd version of ball-gathering game
 */
// colors
const COLORS = ["blue", "red", "yellow", "green", "orange", "violet"];
const CARACT = { "blue": "romantic", "red": "bad", "yellow": "optimistic", "green": "good", "violet": "pessimistic", "orange": "perverse" }
//
const OFFSET = { green: 0, blue: 202, red: 404, violet: 606, orange: 808, yellow: 1010 };

const SHOT_SPEED = 0.8;
const SHOT_WIDTH = 0.04;
const SHOT_RATIO = 3; 

const ANGEL_SPEED = 0.6;
const ANGEL_WIDTH = 0.11;    // percentage of width
const ANGEL_RATIO = 55/80;

const ANGEL_DELAY = 90;
const DELAY_SP = 120;

const SPRITE_ANGEL_WIDTH = 520;
const SPRITE_SUCCUBIA_WIDTH = 552;
const SPRITE_ANGEL_HEIGHT = 800;


class BallGame {

    constructor(resources, level, setup) {
        // rendering info
        this.imgIcones = resources["tokens-spritesheet"];
        this.imgAureole = resources["aureole-spritesheet"];
        this.imgAngie = resources["angie-spritesheet"];
        this.imgSuccubia = resources["succubia-spritesheet"];
        this.sndHit = resources["snd-coup"];
        // animations current spritesheet frame
        this.aureoleSP = 0;
        this.delayBeforeAureoleSP = 0;

        this.level = level;
        this.demonio = level.player;
        this.width = level.width;
        this.height = level.height;

        this.authorizedTokens = COLORS.filter(function(c) {
            return setup.tokens.indexOf(CARACT[c]) >= 0;
        });

        this.DELAY_BEFORE_NEXT_ANGEL = setup.delay;
        this.ANGEL_WIDTH = level.width * ANGEL_WIDTH | 0;
        this.ANGEL_HEIGHT = level.width * ANGEL_WIDTH / ANGEL_RATIO | 0; 

        this.delayBeforeNextAngel = setup.delay;
        this.TVs = level.TVs;

        // game elements 
        this.shot = null;
        this.angels = [];
    }

    resize(oldW, oldH) {
        this.width = this.level.width;
        this.height = this.level.height;    
        this.ANGEL_WIDTH = this.level.width * ANGEL_WIDTH | 0;
        this.ANGEL_HEIGHT = this.level.width * ANGEL_WIDTH / ANGEL_RATIO | 0; 
    }

    addAngel() {
        if (this.authorizedTokens.length == 0) return;

        let pos = Math.random() * (this.width * 2 + this.height * 2) | 0;
        let x, y;
        if (pos < this.width) {
            x = pos;
            y = -this.ANGEL_HEIGHT;
        }
        else if (pos < this.width + this.height) {
            y = pos - this.width;
            x = this.width + this.ANGEL_WIDTH;
        }
        else if (pos < this.width * 2 + this.height) {
            x = this.width * 2 + this.height - pos;
            y = this.height + this.ANGEL_HEIGHT;
        }
        else {
            x = -this.ANGEL_WIDTH;
            y = this.width * 2 + this.height * 2 - pos;
        }
        let altitude = 1;

        let targetX, targetY;

        let tv, tvCoords;
        tv = this.TVs[Math.random()*this.TVs.length | 0];
        tvCoords = tv.getDeliveryCoords();
        targetX = tvCoords.x;
        targetY = tvCoords.y;
        
        let dist = Math.sqrt((targetX-x)*(targetX-x)+(targetY-y)*(targetY-y));

        let movement = { x: (targetX - x)/dist, y: (targetY - y)/dist, z: 0.1, speed: ANGEL_SPEED }
        let color = this.authorizedTokens[Math.random()*this.authorizedTokens.length | 0];

        let sprite = this.imgAngie;
        let spriteW = SPRITE_ANGEL_WIDTH;
        if (color == "red" || color == "violet" || color == "orange") {
            sprite = this.imgSuccubia;
            spriteW = SPRITE_SUCCUBIA_WIDTH;
        }

        let angel = { x, y, altitude, movement, color, frame: 0, delay: ANGEL_DELAY, sprite, spriteW };
        angel.destX = tvCoords.x;
        angel.destY = tvCoords.y;
        angel.tv = tv;
        angel.shot = false;
        
        this.angels.push(angel);
    }


    throwBallTo(x, y) {
        // no double shots
        if (this.shot) {
            return;
        }
        x = x / window.innerWidth * this.width;
        y = y / window.innerHeight * this.height;

        this.demonio.setOrientation(this.demonio.position.x > x ? -1 : 1);

        let c = this.demonio.position.dir > 0 ? -1 : 1;        
        let startX = this.demonio.position.x; // + c * this.demonio.size.width * this.demonio.ratio * 0.2;
        let startY = this.demonio.position.y - this.demonio.size.height * this.demonio.ratio;

        let distance = Math.sqrt((startX - x)*(startX - x) + (startY - y)*(startY - y));

        let movement = {
            x: (x - startX) / distance,
            y: (y - startY) / distance,
            speed: SHOT_SPEED
        };
        this.aureoleSP = 0;
        this.shot = { x: startX, y: startY, w: this.width * SHOT_WIDTH * this.demonio.ratio, h: this.width * SHOT_WIDTH * this.demonio.ratio / SHOT_RATIO, movement };
    }


    update(delta) {
        
        this.delayBeforeNextAngel -= delta;
        if (this.delayBeforeNextAngel < 0) {
            this.addAngel();
            this.delayBeforeNextAngel = this.DELAY_BEFORE_NEXT_ANGEL;
        }
        this.delayBeforeAureoleSP -= delta;
        if (this.delayBeforeAureoleSP < 0) {
            this.delayBeforeAureoleSP = DELAY_SP;
            this.aureoleSP = (this.aureoleSP + 1) % 3;
        }
        
        if (this.shot) {
            this.shot.x = this.shot.x + this.shot.movement.x * this.shot.movement.speed * delta;
            this.shot.y = this.shot.y + this.shot.movement.y * this.shot.movement.speed * delta;
            if (this.shot.x < -this.shot.w || this.shot.x > this.width + this.shot.w || 
                this.shot.y < -this.shot.h || this.shot.y > this.height + this.shot.h) {
                    this.shot = null;
            }
            else {
                let hit = this.shotsHitsAngel();
                if (hit) {
                    this.sndHit.loop = false;
                    this.sndHit.play();
                    //this.shot = null;
                    hit.shot = true;
                    hit.movement.x = 0;
                    hit.movement.y = 1;
                    hit.movement.speed = ANGEL_SPEED / 1;
                }
            }
        }
        for (let i=0; i < this.angels.length; i++) {
            let a = this.angels[i];

            a.delay -= delta;
            if (a.delay < 0) {
                a.delay += ANGEL_DELAY;
                a.frame++;
                if (a.frame * a.spriteW >= a.sprite.width) {
                    a.frame = 0;
                }
            }

            a.x = a.x + a.movement.x * delta * a.movement.speed;
            a.y = a.y + a.movement.y * delta * a.movement.speed;

            if (!a.shot) {
                let distToTarget = (a.x-a.destX)*(a.x-a.destX)+(a.y-a.destY)*(a.y-a.destY);

                const distBreaking = a.color ? this.ANGEL_WIDTH*this.ANGEL_WIDTH*6 : this.ANGEL_WIDTH*this.ANGEL_WIDTH*2;

                if (distToTarget < distBreaking) {
                    let ratio = distToTarget / distBreaking;
                    a.ratio = (0.7 + 0.3*ratio); // * this.level.getRatioFor(a.y);
                    a.movement.speed = (ANGEL_SPEED * 0.1) + (0.9 * ratio * ANGEL_SPEED);  
                    if (distToTarget < 10 && a.color != null) {
                        a.tv.stopBroadcast();
                        a.tv.addToken(CARACT[a.color]);
                        a.color = null;
                    }
                }
                else {
                    a.movement.speed = ANGEL_SPEED;
                    a.ratio = 1;
                }

                
            }

            if (a.x < -this.ANGEL_WIDTH || a.x > this.width + this.ANGEL_WIDTH || a.y < -this.ANGEL_HEIGHT || a.y > this.height + this.ANGEL_HEIGHT) {
                this.angels.splice(i, 1);
                i--;
            }
        }
    }

    shotsHitsAngel() {
        for (let i=0; i < this.angels.length; i++) {
            let a = this.angels[i];
            if (a.ratio < 1) 
            if (this.shot.x > a.x - ANGEL_DELAY*a.ratio / 2 && this.shot.x < a.x + this.ANGEL_WIDTH*a.ratio / 2 && this.shot.y >= a.y - this.ANGEL_HEIGHT*a.ratio / 4 && this.shot.y <= a.y + this.ANGEL_HEIGHT*a.ratio/4) {
                return a;     
            }
        }
        return null;
    }


    render(ctx) {
        if (this.shot) {
            ctx.drawImage(this.imgAureole, 0 + 144*this.aureoleSP, 0, 144, 52, this.shot.x - this.shot.w / 2 | 0, this.shot.y - this.shot.h | 0, this.shot.w | 0, this.shot.h | 0);
        }
        for (let angel of this.angels) {
            if (angel.movement.x == 0 && angel.movement.y == 1) {
                ctx.drawImage(angel.sprite, 0, SPRITE_ANGEL_HEIGHT * (angel.movement.x > 0 ? 2 : 3), angel.spriteW, SPRITE_ANGEL_HEIGHT, angel.x - angel.ratio * this.ANGEL_WIDTH/2 | 0, angel.y - angel.ratio * this.ANGEL_HEIGHT/2 | 0, angel.ratio * this.ANGEL_WIDTH | 0, angel.ratio * this.ANGEL_HEIGHT | 0);            
            }
            else {
                ctx.drawImage(angel.sprite, angel.frame * angel.spriteW, angel.movement.x > 0 ? SPRITE_ANGEL_HEIGHT : 0, angel.spriteW, SPRITE_ANGEL_HEIGHT, angel.x - angel.ratio * this.ANGEL_WIDTH/2 | 0, angel.y - angel.ratio * this.ANGEL_HEIGHT/2 | 0, angel.ratio * this.ANGEL_WIDTH | 0, angel.ratio * this.ANGEL_HEIGHT | 0);
            }

            if (angel.color) {
                let size = angel.ratio * this.ANGEL_WIDTH/8;
                let offsetX = OFFSET[angel.color];
                ctx.drawImage(this.imgIcones, offsetX, 0, 202, 203, angel.x - size | 0, angel.y - size + angel.ratio * this.ANGEL_HEIGHT / 2 | 0, size*2 | 0, size*2 | 0);       
            }
        }
    }

}

export default BallGame;