
export default class ToDoList {

    constructor(list) {
        this.element = document.createElement("div");
        this.element.id = "todo";
        this.list = list.map(function(e) {
            return { target: e.sort(), done: false, element: document.createElement("div") };
        });
        for (let t of this.list) {
            t.element.className = "soul";
            for (let i of t.target) {
                t.element.innerHTML += `<div class="dual ${i}"></div>`;
            }
            this.element.appendChild(t.element);
        }
        this.remaining = list.length;
    }

    complete(soul) {
        for (let i in this.list) {
            if (!this.list[i].done) {
                if (String(soul.caracteristics) == String(this.list[i].target)) {
                    this.list[i].done = true;
                    this.list[i].element.classList.add("done");
                    this.remaining--;
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