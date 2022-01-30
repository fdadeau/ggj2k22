
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
        this.image.src = "../images/icones.png";
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
    
    updateBall(delta) {
        if (this.ball.movement) {
            this.ball.x += this.ball.movement.x * this.ball.speed * delta;
            this.ball.y += this.ball.movement.y * this.ball.speed * delta;
            // ball reaches the line and collides with one of the existing balls
            if(!this.ball.movement.dest) {
                let that = this.ball;
                let idx = this.line.balls.findIndex(function(b) {
                    return (Math.abs(that.x - b.x) < BALL_WIDTH && that.y > b.y && that.y - b.y < BALL_HEIGHT) ;
                });
                if (idx >= 0) {  // hit
                    // insert ball
                    that.y = LINE_Y + BALL_HEIGHT;
                    that.speed = 2*LINE_SPEED;
                    that.movement = { x: 0, y: -1, dest: LINE_Y, index: idx };
                    // spread list
                    this.line.state = LINE.SPREAD;
                    let d = (that.x > this.line.balls[idx].x) ? 
                        (this.line.balls[idx].x + BALL_WIDTH / 2) - (that.x - BALL_WIDTH / 2) :
                        (that.x + BALL_WIDTH / 2) - (this.line.balls[idx].x - BALL_WIDTH / 2) ;
                    this.line.balls.forEach(function(b, i, t) {
                        b.speed = 2*LINE_SPEED;
                        if (i <= idx) {
                            b.movement = { y: 0, x: -1, destX: b.x - d }
                        }
                        else {
                            b.movement = {y: 0, x: 1, destX: b.x + BALL_WIDTH - d }
                        }
                    });
                    return;
                }
            }
            else {
                if (this.ball.y <= this.ball.movement.dest) {
                    this.ball.y = this.ball.movement.dest;
                    // reached position inside line
                    let idx = this.ball.movement.index + 1;
                    this.line.balls.splice(idx, 0, this.ball);
                    this.ball.movement = null;
                    let ballsToRemove = this.checkLine(idx);
                    this.ball = this.nextBall(this.center.x, this.center.y);
                    if (ballsToRemove.length <= 2) {
                        // new ball
                        this.line.balls.forEach(function(b) {
                            b.movement = { x: 1, y: 0 };
                            b.speed = LINE_SPEED;
                        });
                        this.line.state = LINE.ADVANCE;
                    }
                }
            }
            // ball goes out of the screen
            if (this.ball.x < -this.ball.width || this.ball.x > this.width || this.ball.y < -this.ball.height) {
                this.ball = this.nextBall(this.center.x, this.center.y);
            }
        }
    }

    checkLine(index) {
        if (!index){
            index = this.line.balls.findIndex(function(b,i,t) {
                return i < t.length-2 && b.color == t[i+1].color && b.color == t[i+2].color;
            });
            console.log("index sequence :", index);
        }
        if (index < 0) {
            return [];
        }
        let indexes = [index];
        let c = this.line.balls[index].color;
        let i = index - 1;
        while (this.line.balls[i] && this.line.balls[i].color == c) {
            indexes.unshift(i);
            i--;
        }
        i = index + 1;
        while (this.line.balls[i] && this.line.balls[i].color == c) {
            indexes.push(i);
            i++;
        }
        if (indexes.length > 2) {
            // remove existing balls
            for (let i=0; i < indexes.length-2;i++) {
                this.produced.push(CARACT[c]);
            }
            console.log(this.produced);
            
            this.line.balls.splice(indexes[0], indexes.length);
            
            // add new balls at beginning
            for (let i=0; i < indexes.length; i++) {
                let newBall = null; 
                let newX = this.line.balls.length > 0 ? this.line.balls[0].x - BALL_WIDTH : -BALL_WIDTH;
                do {
                    newBall = this.nextBall(newX, LINE_Y, { x: 1, y: 0 });
                }
                while(this.line.balls.length > 1 && this.line.balls[1].color == newBall.color);
                newBall.speed = LINE_SPEED;
                this.line.balls.unshift(newBall);
            }
            
            // make end reverse
            let splitIndex = indexes[0]+indexes.length;
            if (this.line.balls[splitIndex] && this.line.balls[splitIndex].color == this.line.balls[splitIndex-1].color) {
                this.line.balls.forEach(function(b, i) {
                    if (i < splitIndex) {
                        b.movement = { x: 1, destX: b.x - indexes.length * BALL_WIDTH };
                    }
                });
                this.line.state = LINE.JOINS;
            }
            else {
                // make beginning advance to position
                this.line.balls.forEach(function(b, i) {
                    if (i < splitIndex) {
                        b.movement = { x: 1, destX: b.x + indexes.length * BALL_WIDTH };
                        b.speed = LINE_SPEED;
                    }
                });
                this.line.state = LINE.JOINS;
            }
        }
        return indexes;
    }

    getProduced() {
        let r = this.produced;
        this.produced = [];
        return r;
    }

    updateLine(delta) {
        if (this.line.state == LINE.ADVANCE || this.line.state == LINE.JOINS) {
            // remove first ball if necessary 
            while (this.line.balls.length >= 1 && this.line.balls[this.line.balls.length - 1].x > this.width + BALL_WIDTH) {
                //console.log ("remove ball");
                this.line.balls.pop();
                let newBall = null; 
                let newX = this.line.balls.length > 0 ? this.line.balls[0].x - BALL_WIDTH : -BALL_WIDTH;
                do {
                    newBall = this.nextBall(newX, LINE_Y, { x: 1, y: 0 });
                }
                while(this.line.balls.length > 1 && this.line.balls[1].color == newBall.color);
                newBall.speed = LINE_SPEED;
                this.line.balls.unshift(newBall);
            }
            
            // make balls advance
            let reached = false;
            this.line.balls.forEach(function(b) {
                if (b.movement) {
                    b.x += b.movement.x * b.speed * delta;
                    if (this.line.state == LINE.JOINS && (b.movement.x > 0 && b.x >= b.movement.destX) || (b.movement.x < 0 && b.x <= b.movement.destX)) {
                        b.x = b.movement.destX;
                        reached = true;
                        b.movement = { x: 1, y: 0 };
                    }
                }
            }.bind(this));

            if (reached) {
                if (this.checkLine().length < 2) {
                    this.line.balls.forEach(function(b) {
                        b.movement = { x: 1 };
                        b.speed = LINE_SPEED;
                    });
                    this.line.state = LINE.ADVANCE;
                }
            }

            // add new ball if necessary
            if (this.line.balls.length == 0) {
                const newX = this.line.balls.length == 0 ? -BALL_WIDTH : this.line.balls[0].x - BALL_WIDTH;
            } 

            return;
        }

        if (this.line.state == LINE.SPREAD) {
            // make balls advance
            this.line.balls.forEach(function(b) {
                if (b.movement) {
                    b.x += b.movement.x * b.speed * delta;
                    if (b.movement.x < 0 && b.x <= b.movement.destX) {
                        b.x = b.movement.destX;
                        b.movement = null;
                        b.speed = LINE_SPEED;
                    }
                    else if (b.movement.x > 0 && b.x >= b.movement.destX) {
                        b.x = b.movement.destX;
                        b.movement = null;
                        b.speed = LINE_SPEED;
                    }
                }
            });
            return;
        }

    }

    render() {
        this.context.clearRect(0, 0, this.width, this.height);
        // draw line
        this.line.balls.forEach(function(b) {
            this.drawBall(b);

            //this.context.fillStyle = b.color;
            //this.context.fillRect(b.x - b.width / 2 + LINE_PADDING, b.y - b.height / 2 + LINE_PADDING, b.width-2*LINE_PADDING, b.height-2*LINE_PADDING);
        }.bind(this));
        // draw ball
        this.drawBall(this.ball);
       // this.context.fillStyle = this.ball.color;
       // this.context.fillRect(this.ball.x - this.ball.width / 2 + LINE_PADDING, this.ball.y - this.ball.height / 2 + LINE_PADDING, this.ball.width-2*LINE_PADDING, this.ball.height-2*LINE_PADDING);
    }

    drawBall(b) {
        // Arc
        let size = BALL_WIDTH/2 - 2;

        this.context.beginPath();
        this.context.fillStyle = b.color;
        this.context.moveTo(b.x, b.y);
        this.context.arc(b.x, b.y, size, 0, 2 * Math.PI);
        this.context.fill();
        
        let offsetX = 0;
        switch (b.color) {
            case "red":
                offsetX = 400;
                break;
            case "blue":
                offsetX = 200;
                break;
            case "violet":
                offsetX = 600;
                break;
            case "orange":
                offsetX = 800;
                break;
            case "yellow":
                offsetX = 1000;
        }
        this.context.drawImage(this.image, offsetX, 0, 200, 200, b.x - size, b.y - size, size*2, size*2);
//        .fillStyle = b.color;
//        this.context.fillRect(b.x - b.width / 2 + LINE_PADDING, b.y - b.height / 2 + LINE_PADDING, b.width-2*LINE_PADDING, b.height-2*LINE_PADDING);
    }

}

