
// speed
const BALL_SPEED = 0.7;
// size
const BALL_WIDTH = 60;
const BALL_HEIGHT = 60;
// colors
const COLORS = ["blue", "red", "yellow", "green", "orange", "violet"];
const CARACT = { "blue": "romantic", "red": "bad", "yellow": "optimistic", "green": "good", "violet": "pessimistic", "orange": "perverse" }
// line state
const LINE = { ADVANCE: 1, SPREAD: 2, JOINS: 3, EXPLODES: 4 };
// line Y coordinate
const LINE_Y = window.innerHeight * 0.15;
// line speed
const LINE_SPEED = 0.1;
//
const LINE_PADDING = 2;
const OFFSET = { green: 0, blue: 200, red: 400, violet: 600, orange: 800, yellow: 1000 };

export default class Zuma {

    constructor(demo) {
        // rendering info
        this.element = document.createElement("canvas");
        this.context = this.element.getContext("2d");
        this.width = this.element.width = window.innerWidth;
        this.height = this.element.height = window.innerHeight;
        this.element.style.position = "absolute";
        this.element.style.left = "0";
        this.element.style.top = "0";
        this.center = {x: window.innerWidth/2, y: window.innerHeight - BALL_HEIGHT*1.2}
        this.reset();
        this.image = new Image();
        this.image.src = "./images/icones.png";
        this.demo = demo;
    }

    reset() {
        // ball to be sent
        this.ball = this.nextBall(this.center.x, this.center.y);
        // line
        this.line = { state: LINE.ADVANCE, balls: [] };
        for (let i=BALL_WIDTH; i <= this.width + 3*BALL_WIDTH; i += BALL_WIDTH) {
            let b = null;
            do {
                b = this.nextBall(-i, LINE_Y, { x: 1, y: 0 });
            }
            while (this.line.balls.length > 1 && this.line.balls[1].color == b.color);
            b.speed = LINE_SPEED;
            this.line.balls.unshift(b);
        }
        this.produced = [];
    }

    getProduced() {
        let r = this.produced;
        this.produced = [];
        return r;
    }

    throwBallTo(x, y) {
        if (this.ball.movement || this.line.state != LINE.ADVANCE) return;
        let distance = Math.sqrt((this.ball.x - x)*(this.ball.x - x) + (this.ball.y - y)*(this.ball.y - y));
        this.ball.movement = {
            x: (x - this.ball.x) / distance,
            y: (y - this.ball.y) / distance
        };
    }

    nextBall(x, y, m) {
        return { 
            x, 
            y, 
            width: BALL_WIDTH,
            height: BALL_HEIGHT,
            speed: BALL_SPEED, 
            color: COLORS[Math.random() * COLORS.length | 0],
            movement: m
        }
    }

    update(delta) {
        // advance line
        this.updateLine(delta);
        // move ball
        this.updateBall(delta);
    }

    // adds a new ball at the beginning
    addNewBall() {
        // empty line
        if (this.line.balls.length == 0) {
            this.line.balls = [ this.nextBall(-BALL_WIDTH, LINE_Y, { x: 1, y: 0 }) ];
            return;
        }
        // non-empty line
        let newBall = null; 
        let newX = this.line.balls[0].x - BALL_WIDTH;
        do {
            newBall = this.nextBall(newX, LINE_Y);
        }
        while(this.line.balls[1].color == newBall.color);
        newBall.speed = this.line.balls[0].speed;
        if (this.line.balls[0].movement) {
            newBall.movement = Object.assign({}, this.line.balls[0].movement);
        }
        this.line.balls.unshift(newBall);
    }
    
    updateBall(delta) {
        if (this.ball.movement) {
            this.ball.x += this.ball.movement.x * this.ball.speed * delta;
            this.ball.y += this.ball.movement.y * this.ball.speed * delta;
            // ball reaches the line and collides with one of the existing balls
            if(!this.ball.movement.dest) {
                let that = this.ball;
                let idx = this.line.balls.findIndex(function(b) {
                    return (that.x - b.x)*(that.x - b.x) + (that.y - b.y)*(that.y - b.y) <= BALL_WIDTH*BALL_WIDTH;
                });
                if (idx >= 0) {  // hit
                    // determine insert index
                    let min = idx-2 < 0 ? 0 : idx-2;
                    let max = idx + 3 < this.line.balls.length ? idx + 3 : this.line.balls.length;
                    for (let i = min; i < max; i++) {
                        if (this.line.balls[i].x < this.ball.x) {
                            idx = i;
                        }
                    }
                    this.ball.movement = { x: 0, y: -1, dest: LINE_Y, index: idx+1 };
                    this.ball.speed = 2*LINE_SPEED;
                    // spread list
                    this.line.state = LINE.SPREAD;
                    let left = this.line.balls[idx];
                    let newX4left = this.ball.x - BALL_WIDTH;
                    let d = left.x - newX4left;
                    
                    this.line.balls.forEach(function(b, i) {
                        b.speed = 2*LINE_SPEED;
                        if (i <= idx) {
                            b.movement = { x: -1, destX: b.x - d }
                        }
                        else {
                            b.movement = { x: 1, destX: b.x + BALL_WIDTH - d }
                        }
                    });
                    return;
                }
            }
            else {
                if (this.ball.y <= this.ball.movement.dest) {
                    this.ball.y = this.ball.movement.dest;
                    // reached position inside line
                    this.line.balls.splice(this.ball.movement.index, 0, this.ball);
                    this.ball.movement = null;
                    // new ball
                    this.ball = this.nextBall(this.center.x, this.center.y);
                    this.line.state = LINE.ADVANCE;
                }
            }
            // ball goes out of the screen
            if (this.ball.x < -this.ball.width || this.ball.x > this.width || this.ball.y < -this.ball.height) {
                this.ball = this.nextBall(this.center.x, this.center.y);
            }
        }
    }

    checkLine() {
        let index = this.line.balls.findIndex(function(b,i,t) {
            return i < t.length-2 && b.color == t[i+1].color && b.color == t[i+2].color;
        });
        if (index < 0) {
            return [];
        }
        let indexes = [index];
        let c = this.line.balls[index].color;
        let i = index + 1;
        while (this.line.balls[i] && this.line.balls[i].color == c) {
            indexes.push(i);
            i++;
        }
        // if no more than 2 contiguous balls
        if (indexes.length <= 2) {
            return [];
        }
        // add to produced balls (N-2)
        for (let i=0; i < indexes.length-2;i++) {
            this.produced.push(CARACT[c]);
        }            
        // remove existing balls
        this.line.balls.splice(indexes[0], indexes.length);
        // add new balls at beginning to compensate
        for (let i=0; i < indexes.length; i++) {
            this.addNewBall();
        }
        
        // make end rejoin
        let splitIndex = indexes[0]+indexes.length;
        // make left-hand side advance to position
        this.line.balls.forEach(function(b, i) {
            if (i < splitIndex) {
                b.movement = { x: 1, destX: b.x + indexes.length * BALL_WIDTH };
                b.speed = 5*LINE_SPEED;
            }
        });
        this.line.state = LINE.JOINS;

        return indexes;
    }


    updateLine(delta) {        
        // remove balls that are out of sight
        if (this.line.state == LINE.ADVANCE) {
            // remove first ball if necessary 
            while (this.line.balls.length >= 1 && this.line.balls[this.line.balls.length - 1].x > this.width + 3*BALL_WIDTH) {
                //console.log ("remove ball");
                this.line.balls.pop();
                this.addNewBall();
            }
        }

        // make balls advance
        let moved = 0;
        this.line.balls.forEach(function(b) {
            if (b.movement) {
                moved++;
                b.x += b.movement.x * b.speed * delta;
                if ((b.movement.x < 0 && b.x <= b.movement.destX) || (b.movement.x > 0 && b.x > b.movement.destX)) {
                    b.x = b.movement.destX;
                    b.movement = null;
                }
            }
        }.bind(this));

        // terminate if line is spreading (the inserting ball will restart the line)
        if (this.line.state == LINE.SPREAD) {
            return;
        }

        // no ball is moving
        if (moved == 0) {
            // --> check number of contigous balls
            if (this.checkLine().length == 0) {                    
                // restart the line
                this.line.balls.forEach(function(b) {
                    b.movement = { x: 1 };
                    b.speed = LINE_SPEED;
                });
                this.line.state = LINE.ADVANCE;
            }
        }

    }

    render() {
        this.context.clearRect(0, 0, this.width, this.height);
        // draw line
        for (let i=0; i < this.line.balls.length; i++) {
            this.drawBall(this.line.balls[i]);
        }
        // draw ball
        this.drawBall(this.ball);
    }

    drawBall(b) {
        // Arc
        let size = BALL_WIDTH/2 - 2;

        this.context.beginPath();
        this.context.fillStyle = b.color;
        this.context.moveTo(b.x, b.y);
        this.context.arc(b.x, b.y, size, 0, 2 * Math.PI);
        this.context.fill();
        
        let offsetX = OFFSET[b.color];
        this.context.drawImage(this.image, offsetX, 0, 200, 200, b.x - size, b.y - size, size*2, size*2);
    }

}

