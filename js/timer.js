
export default class Timer {

    constructor(time, level) {
        this.element = document.createElement("div");
        this.element.id = "timer";
        this.remaining = time * 1000; 
        this.displayed = time;
        this.level = level;
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
            this.element.dataset.value = `${d / 60 | 0}:${("0" + (d % 60)).slice(-2) }`;
        }        
    } 

}