
const SOURCE_SIZE = { width: 200, height: 300 };

export default class Source {

    constructor(x, y) {
        this.element = document.createElement("div");
        this.element.id = "source";
        this.element.style = `--sprite-width: ${SOURCE_SIZE.width}px; --sprite-height: ${SOURCE_SIZE.height}px;`;
        this.element.style.top = (y | 0) + "px";
        this.element.style.zIndex = (y - SOURCE_SIZE.height/6 | 0);
        this.element.style.left = (x | 0) + "px";
        this.position = { x: x, y: y };
        this.audio = new Audio();
        this.audio.src = "./sounds/Robinet.wav";
    }

    collides(x, y, w, h) {
        return !(
            x + w/2 < this.position.x - SOURCE_SIZE.width / 6 ||
            x - w/2 > this.position.x + SOURCE_SIZE.width / 6 ||
            y > this.position.y ||
            y < this.position.y - SOURCE_SIZE.height / 5
        );
    }

    isClose(x, y) {
        return (x - this.position.x)*(x - this.position.x) + (y - this.position.y)*(y - this.position.y) < SOURCE_SIZE.height*SOURCE_SIZE.height*0.25;
    }

}