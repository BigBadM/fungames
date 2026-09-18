import CanvasRenderer from './CanvasRenderer.js';
export default class Player {
    image;
    posX;
    posY;
    maxX;
    speed = 2;
    movingLeft = false;
    movingRight = false;
    constructor(maxX, maxY) {
        this.image = CanvasRenderer.loadNewImage('./assets/droid.png');
        this.maxX = maxX;
        this.posX = (maxX / 2) - (this.image.width / 2);
        this.posY = maxY - this.image.height;
    }
    moveLeft() {
        this.movingLeft = true;
    }
    moveRight() {
        this.movingRight = true;
    }
    isCollidingFruit(fruit) {
        if (this.posX < fruit.getPosX() + fruit.getWidth() &&
            this.posX + this.getWidth() > fruit.getPosX() &&
            this.posY < fruit.getPosY() + fruit.getHeight() &&
            this.posY + this.getHeight() > fruit.getPosY()) {
            return true;
        }
        else {
            return false;
        }
    }
    isCollidingSpider(spider) {
        if (this.posX < spider.getPosX() + spider.getWidth() &&
            this.posX + this.getWidth() > spider.getPosX() &&
            this.posY < spider.getPosY() + spider.getHeight() &&
            this.posY + this.getHeight() > spider.getPosY()) {
            return true;
        }
        else {
            return false;
        }
    }
    update(delta) {
        if (this.movingLeft) {
            this.posX -= delta * 0.5 * this.speed;
            this.movingLeft = false;
        }
        if (this.movingRight) {
            this.posX += delta * 0.5 * this.speed;
            this.movingRight = false;
        }
    }
    render(canvas) {
        CanvasRenderer.drawImage(canvas, this.image, this.posX, this.posY);
    }
    getPosX() {
        return this.posX;
    }
    getPosY() {
        return this.posY;
    }
    getWidth() {
        return this.image.width;
    }
    getHeight() {
        return this.image.height;
    }
}
//# sourceMappingURL=Player.js.map