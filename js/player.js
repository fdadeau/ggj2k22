const PLAYER_SPEED = 0.3;

const PLAYER_SIZE = { width: 555*0.3, height: 575*0.3 };

export default class Player {

    constructor(level, startX, startY) {

        // position == middle + center
        this.position = { x: startX, y: startY };
        this.movement = { x: 0, y: 0 };
        this.speed = PLAYER_SPEED;
        this.size = { width : PLAYER_SIZE.width, height: PLAYER_SIZE.height };

        // rendering
        this.element = document.createElement("div");
        this.element.id = "player";
        this.element.style = "--sprite-width: " + PLAYER_SIZE.width + "px; --sprite-height: " + PLAYER_SIZE.height + "px;";
        this.element.style.top = this.position.y + "px";
        this.element.style.zIndex = this.position.y;
        this.element.style.left = this.position.x + "px";

        // pointer to upper structure
        this.level = level;

        this.delay = 0; 
        
        // carried soul
        this.soul = null;
    }


    update(delta) {
        if (this.delay > 0) {
            this.delay -= delta;
            return;
        }
        if (this.movement.x !== 0 || this.movement.y !== 0) {
            let newX = this.position.x + this.speed * delta * this.movement.x; 
            let newY = this.position.y + this.speed*0.7 * delta * this.movement.y; 

            if (this.level.collides(newX, newY, PLAYER_SIZE.width, PLAYER_SIZE.height)) {
                return;
            }

            this.position.x = newX;
            this.position.y = newY;
            this.element.style.top = this.position.y + "px";
            this.element.style.left = this.position.x + "px";
            this.element.style.zIndex = this.position.y | 0;
        }
    }

    /**** Game actions ****/
    dropSoul() {
        if (this.soul) {
            this.soul.drop(this.position.x, this.position.y);
        }
        this.soul = null;
        this.level.element.classList.remove("withSoul");
    }
    pickupSoul(soul) {
        this.soul = soul;
        soul.pickup();
        this.level.element.classList.add("withSoul");
    }


    // processing of keyboard events
    processKey(upOrDown, code) {
        if (upOrDown == "down") {
            switch (code) {
                case 'ArrowLeft': 
                case 'KeyA':
                    this.movement.x = -1;
                    this.element.classList.remove("toRight");
                    break;
                case 'ArrowRight': 
                case 'KeyD':
                    this.movement.x = 1;
                    this.element.classList.add("toRight");
                    break;
                case 'ArrowUp': 
                case 'KeyW':
                    this.movement.y = -1;
                    break;
                case 'ArrowDown': 
                case 'KeyS':
                    this.movement.y = 1;
                    break;
            }
        }
        else {
            switch (code) {
                case 'ArrowLeft': 
                case 'KeyA':
                    if (this.movement.x == -1) {
                        this.movement.x = 0;
                    }
                    break;
                case 'ArrowRight': 
                case 'KeyD':
                    if (this.movement.x == 1) {
                        this.movement.x = 0;
                    }
                    break;
                case 'ArrowUp': 
                case 'KeyW':
                    if (this.movement.y == -1) {
                        this.movement.y = 0;
                    }
                    break;
                case 'ArrowDown': 
                case 'KeyS':
                    if (this.movement.y == 1) {
                        this.movement.y = 0;
                    }
                    break;
            }
        }
    }
}
