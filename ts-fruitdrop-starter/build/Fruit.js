import CanvasRenderer from './CanvasRenderer.js';
import ScoreItem from './ScoreItems.js';
export default class Fruit extends ScoreItem {
    speed;
    agartha = false;
    constructor(maxX, allowAgartha = true, forceSpecial = false) {
        super();
        this.posX = 0;
        this.posY = 0;
        this.score = 0;
        this.speed = 0.3;
        const random = Math.random();
        if (forceSpecial || (allowAgartha && random > 0.9999)) {
            this.image = CanvasRenderer.loadNewImage('./assets/monster.ico');
            this.score = 100;
            this.agartha = true;
        }
        else if (random > 0.9) {
            this.image = CanvasRenderer.loadNewImage('./assets/needle.png');
            this.score = 10;
        }
        else if (random > 0.7) {
            this.image = CanvasRenderer.loadNewImage('./assets/chicken.png');
            this.score = 7;
        }
        else if (random > 0.4) {
            this.image = CanvasRenderer.loadNewImage('./assets/basketball.png');
            this.score = 5;
        }
        else if (random > 0.2) {
            this.image = CanvasRenderer.loadNewImage('./assets/watermelon.png');
            this.score = 3;
        }
        else {
            this.image = CanvasRenderer.loadNewImage('./assets/fruit-banana.png');
            this.score = 1;
        }
        this.posX = (Math.random() * maxX);
        this.posY = -32;
    }
    update(delta) {
        this.posY += delta * 0.15 * this.speed;
        this.speed += 0.02;
    }
}
//# sourceMappingURL=Fruit.js.map