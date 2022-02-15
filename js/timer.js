
export default class Timer {

    constructor(time, level) {
        this.remaining = time * 1000; 
        this.displayed = time;
        this.level = level;
        this.level.element.dataset.time = `${time / 60 | 0}:${("0" + (time % 60)).slice(-2) }`;
    }

    update(delta) {
        this.remaining -= delta;
        if (this.remaining < 0) {
            this.level.gameover(false);
            return;
        }
        let d = this.remaining / 1000 | 0;
        if (d !== this.displayed) {
            this.displayed = d;
            this.level.element.dataset.time = `${d / 60 | 0}:${("0" + (d % 60)).slice(-2) }`;
        }        
    } 

}