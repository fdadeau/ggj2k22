/***
 *  2nd version of ball-gathering game
 */
// size
const BALL_WIDTH = 50;
const BALL_HEIGHT = 50;
// colors
const COLORS = ["blue", "red", "yellow", "green", "orange", "violet"];
const CARACT = { "blue": "romantic", "red": "bad", "yellow": "optimistic", "green": "good", "violet": "pessimistic", "orange": "perverse" }
//
const OFFSET = { green: 0, blue: 200, red: 400, violet: 600, orange: 800, yellow: 1000 };

const DELAY_BEFORE_NEXT_ANGEL = 3000;   // in ms
const ANGEL_SPEED = 0.4;
const SHOT_SPEED = 0.8;
const SHOT_WIDTH = 10;
const SHOT_HEIGHT = 10;
const ANGEL_WIDTH = 70 | 0;
const ANGEL_HEIGHT = ANGEL_WIDTH * 1.4 | 0;
const OFFSETY = ANGEL_HEIGHT + 20;

class BallGame {

    constructor(demonio, TVs) {
        // rendering info
        this.element = document.createElement("canvas");
        this.context = this.element.getContext("2d");
        this.width = this.element.width = window.innerWidth;
        this.height = this.element.height = window.innerHeight;
        this.element.style.position = "absolute";
        this.element.style.left = "0";
        this.element.style.top = "0";
        this.image = new Image();
        this.image.src = "./images/icones.png";
        this.demonio = demonio;
        this.reset();
        this.delayBeforeNextAngel = DELAY_BEFORE_NEXT_ANGEL;
    }

    reset() {
        this.shot = null;
        this.angels = [];
        this.produced = [];
    }

    addAngel() {
        // TODO compute random start position
        let pos = Math.random() * (this.width * 2 + this.height * 2) | 0;
        let x, y;
        if (pos < this.width) {
            x = pos;
            y = -ANGEL_HEIGHT;
        }
        else if (pos < this.width + this.height) {
            y = pos - this.width;
            x = this.width + ANGEL_WIDTH;
        }
        else if (pos < this.width * 2 + this.height) {
            x = this.width * 2 + this.height - pos;
            y = this.height + ANGEL_HEIGHT;
        }
        else {
            x = -ANGEL_WIDTH;
            y = this.width * 2 + this.height * 2 - pos;
        }
        let altitude = 1;

        let targetX = Math.random() * this.width / 3 + this.width / 3 | 0;
        let targetY = Math.random() * this.height / 3 + this.height / 3 | 0;
        
        let dist = Math.sqrt((targetX-x)*(targetX-x)+(targetY-y)*(targetY-y));

        let movement = { x: (targetX - x)/dist, y: (targetY - y)/dist, z: 0.1, speed: ANGEL_SPEED }
        let color = COLORS[Math.random()*COLORS.length | 0];

        let angel = { x, y, altitude, movement, color };
        this.angels.push(angel);
    }

    getProduced() {
        let r = this.produced;
        this.produced = [];
        return r;
    }

    throwBallTo(x, y) {
        // no double shots
        if (this.shot) {
            return;
        }
        this.demonio.setOrientation(this.demonio.position.x < x ? -1 : 1);

        let startX = this.demonio.position.x;
        let startY = this.demonio.position.y - this.demonio.size.height / 2;

        let distance = Math.sqrt((startX - x)*(startX - x) + (startY - y)*(startY - y));

        let movement = {
            x: (x - startX) / distance,
            y: (y - startY) / distance,
            speed: SHOT_SPEED
        };

        this.shot = { x: startX, y: startY, w: SHOT_WIDTH, h: SHOT_HEIGHT, movement };
    }


    update(delta) {
        this.delayBeforeNextAngel -= delta;
        if (this.delayBeforeNextAngel < 0) {
            this.addAngel();
            this.delayBeforeNextAngel = DELAY_BEFORE_NEXT_ANGEL;
        }
        if (this.shot) {
            this.shot.x = this.shot.x + this.shot.movement.x * this.shot.movement.speed * delta;
            this.shot.y = this.shot.y + this.shot.movement.y * this.shot.movement.speed * delta;
            if (this.shot.x < -BALL_WIDTH || this.shot.x > this.width + BALL_WIDTH || 
                this.shot.y < -BALL_HEIGHT || this.shot.y > this.height + BALL_HEIGHT) {
                    this.shot = null;
            }
            else {
                let hit = this.shotsHitsAngel();
                if (hit) {
                    this.shot = null;
                    this.produced.push(CARACT[hit.color]);
                    hit.color = null;
                    hit.movement.x = 0;
                    hit.movement.y = 1;
                }
            }
        }
        for (let i=0; i < this.angels.length; i++) {
            let a = this.angels[i];
            a.x = a.x + a.movement.x * delta * a.movement.speed;
            a.y = a.y + a.movement.y * delta * a.movement.speed;
            if (a.x < -ANGEL_WIDTH || a.x > this.width + ANGEL_WIDTH || a.y < -ANGEL_HEIGHT || a.y > this.height + this.ANGEL_HEIGHT) {
                this.angels.splice(i, 1);
                i--;
            }
        }
    }


    shotsHitsAngel() {
        for (let i=0; i < this.angels.length; i++) {
            let a = this.angels[i];
            if ((a.x - this.shot.x)*(a.x - this.shot.x)+(a.y - this.shot.y)*(a.y - this.shot.y) < BALL_WIDTH*BALL_WIDTH) {
                return a;     
            }
        }
        return null;
    }


    render() {
        this.context.clearRect(0, 0, this.width, this.height);
        if (this.shot) {
            this.context.fillStyle = "#000";
            this.context.fillRect(this.shot.x - this.shot.w /2, this.shot.y - this.shot.w / 2, this.shot.w, this.shot.h);
        }
        for (let angel of this.angels) {
            this.context.strokeRect(angel.x - ANGEL_WIDTH/2, angel.y - ANGEL_HEIGHT/2, ANGEL_WIDTH, ANGEL_HEIGHT);
            if (angel.color) {
                let size = BALL_WIDTH/2 - 2;
                this.context.beginPath();
                this.context.fillStyle = angel.color;
                this.context.arc(angel.x, angel.y + OFFSETY, size, 0, 2 * Math.PI);
                this.context.fill();
            
                let offsetX = OFFSET[angel.color];
                this.context.drawImage(this.image, offsetX, 0, 200, 200, angel.x - size, angel.y - size + OFFSETY, size*2, size*2);       
            }
        }
    }

}

export default BallGame;