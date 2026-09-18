import CanvasRenderer from './CanvasRenderer.js';
export default class ScoreItem {
    image;
    posX;
    posY;
    score;
    constructor() {
        this.posX = 0;
        this.posY = 0;
        this.score = 0;
        this.image = new Image();
    }
    getPosX() {
        return this.posX;
    }
    getPosY() {
        return this.posY;
    }
    render(canvas) {
        CanvasRenderer.drawImage(canvas, this.image, this.posX, this.posY);
    }
    getWidth() {
        return this.image.width;
    }
    getHeight() {
        return this.image.height;
    }
    getScore() {
        return this.score;
    }
}
//# sourceMappingURL=ScoreItems.js.map