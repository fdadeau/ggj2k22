

const SOUL_STATE = { CARRIED: "carried", ON_THE_FLOOR: "on_the_floor", WATCHING_TV: "watching_tv", COMPLETED: "completed" };

const SOUL_TIME = 4;   // in seconds

const SOUL_SIZE = { width: 80, height: 80 };

export default class Soul {

    constructor() {
        // rendering info
        this.element = document.createElement("div");
        this.element.classList.add("soul");
        this.element.style = "--sprite-width: " + SOUL_SIZE.width + "px; --sprite-height: " + SOUL_SIZE.height + "px;";

        this.tv = null;
        this.time = 0;
        this.caracteristics = [];
        this.state = SOUL_STATE.CARRIED;
        this.isWatching = null;
    }  

    /**** Game actions ****/

    bindToTv(tv) {
        this.tv = tv;
        tv.soul = this;
        this.state = SOUL_STATE.WATCHING_TV;
        let pos = tv.getSoulPosition();
        this.element.style.left = pos.x + "px";
        this.element.style.top = pos.y + "px";
        this.element.style.zIndex = pos.y - SOUL_SIZE.height | 0;
        this.element.className = "soul " + this.state;
        if (this.tv.element.classList.contains("flip")) {
            this.element.classList.add("flip");
        }
    }
    takeFromTv() {
        this.state = SOUL_STATE.CARRIED;
        this.element.className = "soul " + this.state;
        this.tv.soul = null;
        this.tv = null;
        this.isWatching = null;
    }
    drop(x, y) {
        this.state = SOUL_STATE.ON_THE_FLOOR;
        this.position = { x: x, y: y };
        this.element.className = "soul " + this.state;
        this.element.style.top = y + "px";
        this.element.style.left = x + "px";
    }
    pickup() {
        this.state = SOUL_STATE.CARRIED;
        this.element.className = "soul " + this.state;
        if (this.tv) {
            this.tv.soul = null;
            this.tv = null;
            this.isWatching = null;
        }
    }

    startWatching(broadcast) {
        this.isWatching = broadcast;
        this.delay = SOUL_TIME * 1000;
        this.element.classList.add(this.isWatching);
    }
    stopWatching() {
        this.element.classList.remove(this.isWatching);
        this.isWatching = null;
        this.delay = 0;
    }



    isClose(x, y) {
        return (this.state == SOUL_STATE.WATCHING_TV || this.state == SOUL_STATE.ON_THE_FLOOR) && (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < SOUL_SIZE.width*SOUL_SIZE.width;
    }

    increase(caract) {
        this.caracteristics.push(caract);
        this.caracteristics.sort();
        let html = "";
        for (let c of this.caracteristics) {
            html += `<div class="dual ${c}"></div>`;
        }
        this.element.innerHTML = html;
    }

    update(delta) {
        if (this.isWatching) {
            this.delay -= delta;
            if (this.delay < 0) {
                this.increase(this.isWatching);
                this.delay = SOUL_TIME * 1000;
            }
        }
    }

}