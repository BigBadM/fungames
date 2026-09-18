import CanvasRenderer from './CanvasRenderer.js';
import ScoreItem from './ScoreItems.js';
export default class Spider extends ScoreItem {
    constructor(maxX) {
        super();
        this.posX = 0;
        this.posY = 0;
        this.score = 0;
        const random = Math.random();
        if (random > 0.95) {
            this.image = CanvasRenderer.loadNewImage('./assets/derk.ico');
            this.score = -100;
        }
        else if (random > 0.65) {
            this.image = CanvasRenderer.loadNewImage('./assets/jobapllication.ico');
            this.score = -5;
        }
        else if (random > 0.30) {
            this.image = CanvasRenderer.loadNewImage('./assets/policecar.png');
            this.score = -3;
        }
        else {
            this.image = CanvasRenderer.loadNewImage('./assets/baby.png');
            this.score = -1;
        }
        this.posX = (Math.random() * maxX);
        this.posY = -32;
    }
    update(delta) {
        this.posY += delta * 0.1;
    }
}
//# sourceMappingURL=Spider.js.map