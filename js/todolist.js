import Soul from "./soul.js";

export default class ToDoList {

    constructor(resources, level, list) {
        this.element = document.createElement("canvas");
        this.element.width = 400;
        this.element.style.width = "400px";
        this.element.style.zIndex = 1001;
        this.element.height = 80;
        this.element.style.height = "80px";
        this.context = this.element.getContext("2d");
        this.element.id = "todo";
        this.imgCheck = resources["coche-verte"];
        this.list = list.map(function(e, i) {
            let soul = new Soul(resources, level);
            soul.caracteristics = e.sort();
            soul.size.width = 70;
            soul.size.height = 70;
            soul.displayAt(this.context, i*70+40, 75, 1)
            return { target: e.sort(), done: false };
        }.bind(this));
        this.remaining = list.length;
    }

    complete(soul) {
        for (let i in this.list) {
            if (!this.list[i].done) {
                if (String(soul.caracteristics) == String(this.list[i].target)) {
                    this.list[i].done = true;
                    this.remaining--;
                    this.context.drawImage(this.imgCheck, i*70+15, 15, 50, 50);
                    return true;
                }
            }
        }
        return false;
    }

    isFulfilled() {
        return this.remaining == 0;
    }

    
}