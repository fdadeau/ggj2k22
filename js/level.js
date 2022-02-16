import Player from "./player.js";
import TV from "./tv.js";
import Source from "./source.js";
import BallGame from "./ballgame.js";
import Soul from "./soul.js";
import Timer from "./timer.js";
import ToDoList from "./todolist.js";
import Exit from "./exit.js";



export default class Level {

    constructor(setup, elt, resources, callback) {
        this.setup = setup;
        this.resources = resources;

        this.element = elt;
        this.canvas = document.createElement("canvas");
        this.canvas.id = "cvsGame"
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width = window.innerWidth * 0.9; // / 2;
        this.height = this.canvas.height = window.innerHeight * 0.9; // / 2;
       
        this.maxY = this.height * 0.9;
        this.minY = this.height * 0.4;

        // 
        this.timer = new Timer(setup.time, this);
        this.todo = new ToDoList(resources, this, setup.goal);
        //
        this.player = new Player(resources, this, setup.player.x, setup.player.y);
        //
        this.source = new Source(resources, this, setup.source.x, setup.source.y);
        this.exit = new Exit(resources, this, setup.exit.x, setup.exit.y);

        // ressource generator
        this.TVs = [];
        for (let tv of setup.TVs) {
            this.TVs.push(new TV(resources, this, tv.x, tv.y));
        }
        this.zuma = new BallGame(resources, this, setup);

        // closest element to the player
        this.closest = null;

        // souls currently built
        this.souls = [];

        // is game over? 
        this.over = true;
        // callback to notify game over
        this.callback = callback;

        // button start game
        let btnStart = document.createElement("button");
        btnStart.innerHTML = "Start!";
        btnStart.id = "btnStartLevel";
        btnStart.dataset.level = this.element.dataset.level;

        // append elements to current GUI
        this.element.innerHTML = "";
        this.element.appendChild(this.todo.element);
        this.element.appendChild(this.canvas);
        this.element.appendChild(btnStart);

        // render initial layout
        this.render();
    }

    resize() {
        let oldW = this.width; 
        let oldH = this.height;
        this.width = this.canvas.width = window.innerWidth * 0.9; // / 2;
        this.height = this.canvas.height = window.innerHeight * 0.9; // / 2;
        this.maxY = this.height * 0.9;
        this.minY = this.height * 0.4;
        this.player.resize(oldW, oldH);
        this.source.resize(oldW, oldH);
        this.exit.resize(oldW, oldH);
        this.zuma.resize(oldW, oldH);
        this.TVs.forEach(function(tv) { tv.resize(oldW, oldH) });
    }

    // GAME LEVEL MANAGEMENT

    reset() {
        this.over = false;
    }

    gameover(b) {
        this.over = true;
        this.TVs.forEach(function(tv) { tv.stopBroadcast(); });
        let score = 0, time = this.setup.time - this.timer.remaining/1000;
        if (b) {
            for (let t of this.setup.score) {
                if (time < t) {
                    score++;
                }
            }
        }
        this.callback(b, score);
    }
    


    /**************************************************************
     *               UPDATE/RENDERING FUNCTIONS                   *
     **************************************************************/

    update(delta) {
        if (this.over) {
            return false;
        }
        // TIME UPDATE
        this.timer.update(delta);
        // ZUMA 
        this.zuma.update(delta);
        // entry & exit 
        this.source.update(delta);
        this.exit.update(delta);
        // TV updates
        for (let i=0; i < this.TVs.length; i++) {
            this.TVs[i].update(delta);
        };
        // PLAYER  
        this.player.update(delta);
        // SOULS
        for (let i=0; i < this.souls.length; i++) {
            this.souls[i].update(delta);
        };

        let old = this.closest;
        this.closest = this.getClosest(this.player.position.x, this.player.position.y, this.player.size.width * this.player.ratio, this.player.size.height * this.player.ratio);
        if (old != this.closest) {
            this.element.dataset.action = (this.closest != null) ? this.closest.constructor.name : "None";
        }

        return true;
    }

    render() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.exit.render(this.context);
        for (let i=0; i < this.TVs.length; i++) {
            this.TVs[i].render(this.context);
        }
        for (let i=0; i < this.souls.length; i++) {
            this.souls[i].render(this.context);
        }
        if (this.player.position.y < this.source.position.y) {
            this.player.render(this.context);
            this.source.render(this.context);
        }
        else {
            this.source.render(this.context);
            this.player.render(this.context);
        }
        this.zuma.render(this.context);
    }


    /**************************************************************
     *                          GAME ACTIONS                      *
     **************************************************************/

    createSoul() {
        let soul = new Soul(this.resources, this);
        this.souls.push(soul);
        this.source.activate();
        this.player.delay = 2000;
        this.source.audio.play();
        setTimeout(function() {
            this.player.pickupSoul(soul);
        }.bind(this), 2000);
    }

    deliverSoul(soul) {
        let idx = this.souls.indexOf(soul);
        if (idx >= 0) {
            this.souls.splice(idx, 1);
            this.exit.deliver(soul);
            setTimeout(function() {
                let ok = this.todo.complete(soul);
                this.exit.play(ok);
                if (this.todo.remaining == 0) {
                    this.gameover(true);
                }
            }.bind(this), 2000);
        }
    }

    dropBeforeTv(soul,tv) {
        this.player.dropSoul();
        soul.bindToTv(tv);
    }

    takeFromBeforeTv(soul) {
        soul.takeFromTv();
        this.player.pickupSoul(soul);
    }


    /*** Collisions + proximity checks ***/

    collides(x, y, w, h) {
        if (y > this.maxY || y < this.minY || x < w/2 || x > this.width - w/2) {
            return true;
        }
        if (this.source.collides(x, y, w, h)) {
            return true;
        }
        return false;
    }

    getRatioFor(y) {
        return 0.7 + 0.3 * (y - this.minY) / (this.maxY - this.minY)
    }

    getClosest(x, y) {
        for (let s of this.souls) {
            if (s.isClose(x, y)) {
                return s;
            }
        } 
        for (let tv of this.TVs) {
            if (tv.isClose(x, y)) {
                return tv;
            }
        }  
        if (this.source.isClose(x, y)) {
            return this.source;
        }
        if (this.exit.isClose(x, y)) {
            return this.exit;
        }
        return null; 
    }



    /********************************** 
     *       GUI Interactions         *
     **********************************/

    processKey(upOrDown, key) {
        if (!this.over && upOrDown == "down" && key == "KeyP") {
            this.over = !this.over;
            let that = this;
            this.TVs.forEach(function(tv) {
                if (tv.audio) {
                    if (that.over) { 
                        tv.audio.pause();
                    }
                    else {
                        tv.audio.play();
                    }
                }
            });
            this.callback();
        }

        if (this.player.delay <= 0 && key == 'Space' && upOrDown == 'down') {
            if (this.closest != null) {
                if (this.closest instanceof Source && !this.player.soul) {
                    this.createSoul();
                }
                else if (this.closest instanceof TV) {
                    if (this.closest.soul && !this.player.soul) {
                        this.takeFromBeforeTv(this.closest.soul);
                    }
                    else if (this.player.soul && !this.closest.soul) {
                        this.dropBeforeTv(this.player.soul, this.closest);
                    }
                }
                else if (this.closest instanceof Soul && !this.player.soul) {
                    this.player.pickupSoul(this.closest);
                }
                else if (this.closest instanceof Exit && this.player.soul) {
                    this.deliverSoul(this.player.soul);
                    this.player.dropSoul();
                }
            }
            else if (this.player.soul != null) {
                this.player.dropSoul();
            }
        }
        if (!this.over) {
            this.player.processKey(upOrDown, key);
        }
    }

    click(x, y) {
        if (!this.over) {
            this.zuma.throwBallTo(x,y);            
        }
    }

}
