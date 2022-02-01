import Player from "./player.js";
import TV from "./tv.js";
import Source from "./source.js";
import Zuma from "./zuma.js";
import Soul from "./soul.js";
import Timer from "./timer.js";
import ToDoList from "./todolist.js";
import Exit from "./exit.js";

export default class Level {

    constructor(setup, elt) {
        this.element = elt;
        // 
        this.timer = new Timer(setup.time, this);
        this.todo = new ToDoList(setup.goal);

        this.player = new Player(this, 0.01 * window.innerWidth * setup.player.x, 0.01 * window.innerHeight * setup.player.y);
        //
        this.source = new Source(0.01 * window.innerWidth * setup.source.x, 0.01 * window.innerHeight * setup.source.y);
        this.exit = new Exit(0.01 * window.innerWidth * setup.exit.x, 0.01 * window.innerHeight * setup.exit.y);

        // ressource generator
        this.zuma = new Zuma(this.player);
        this.TVs = [];
        for (let tv of setup.TVs) {
            this.TVs.push(new TV(tv.kind, 0.01 * window.innerWidth * tv.x, 0.01 * window.innerHeight * tv.y));
        }
        this.closest = null;

        // souls currently built
        this.souls = [];

        this.over = true;
    }

    // GAME LEVEL MANAGEMENT

    reset() {
        this.over = false;
    }

    load() {
        this.element.innerHTML = "";
        this.element.appendChild(this.timer.element);
        this.element.appendChild(this.todo.element);
        this.element.appendChild(this.source.element);
        this.element.appendChild(this.exit.element);
        for (let tv of this.TVs) {
            this.element.appendChild(tv.element);
        }
        this.element.appendChild(this.player.element);
        this.element.appendChild(this.zuma.element);
    }

    gameover() {
        this.over = true;
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
        // TV 
        let benefits = this.zuma.getProduced();
        if (benefits.length > 0) {
            // dispatch benefits to TVs
            this.TVs.forEach(function(tv) {
                tv.addTokens(benefits);
            });
        }
        // TV updates
        this.TVs.forEach(function(tv) {
            tv.update(delta);
        });
        // PLAYER  
        this.player.update(delta);
        // SOULS
        this.souls.forEach(function(s) {
            s.update(delta);
        });


        let old = this.closest;
        this.closest = this.getClosest(this.player.position.x, this.player.position.y, this.player.size.width, this.player.size.height);
        if (old != this.closest) {
            this.element.dataset.action = (this.closest != null) ? this.closest.constructor.name : "None";
        }

        return true;
    }

    render() {
        this.zuma.render();
    }


    /**************************************************************
     *                          GAME ACTIONS                      *
     **************************************************************/

    createSoul() {
        let soul = new Soul();
        this.souls.push(soul);
        this.source.element.classList.add("anim");
        this.player.delay = 3000;
        this.source.audio.play();
        setTimeout(function() {
            this.element.insertBefore(soul.element, this.zuma.element);
            this.player.pickupSoul(soul);
            this.source.element.classList.remove("anim");
        }.bind(this), 3000);
    }

    deliverSoul(soul) {
        let idx = this.souls.indexOf(soul);
        if (idx >= 0) {
            this.souls.splice(idx, 1);
            soul.element.parentElement.removeChild(soul.element);
            let ok = this.todo.complete(soul);
            this.exit.play(ok);
            if (this.todo.remaining == 0) {
                this.gameover(true);
            }
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
        if (y > window.innerHeight * 5/6 || y < window.innerHeight / 2.5 || x < w/2 || x > window.innerWidth - w/2) {
            return true;
        }
        for (let tv of this.TVs) {
            if (tv.collides(x, y, w, h)) {
                return true;
            }
        }
        if (this.source.collides(x, y, w, h)) {
            return true;
        }
        return false;
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
        if (this.player.delay > 0) {
            return;
        }
        if (key == 'Space' && upOrDown == 'down') {
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
