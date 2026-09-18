import Game from './Game.js';
import Spider from './Spider.js';
import Fruit from './Fruit.js';
import Player from './Player.js';
import CanvasRenderer from './CanvasRenderer.js';
import KeyListener from './keyListener.js';
import SoundManager from './soundManager.js';
export default class FruitDrop extends Game {
    canvas;
    spiders;
    inAgartha = false;
    agarthaTimer = 0;
    nextItem;
    score = 0;
    fruits;
    keyListener;
    player;
    spawnCounter = 0;
    constructor(canvas) {
        super();
        this.keyListener = new KeyListener;
        this.canvas = canvas;
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.spiders = [];
        this.fruits = [];
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.nextItem = Math.random() * 3000;
    }
    makeItemSpider() {
        this.spiders.push(new Spider(this.canvas.width));
    }
    makeItemFruit(allowAgartha = true, forceSpecial = false) {
        this.fruits.push(new Fruit(this.canvas.width, allowAgartha, forceSpecial));
    }
    processInput() {
        if (this.keyListener.isKeyDown(KeyListener.KEY_LEFT)) {
            this.player.moveLeft();
            this.player.update(10);
        }
        if (this.keyListener.isKeyDown(KeyListener.KEY_RIGHT)) {
            this.player.moveRight();
            this.player.update(10);
        }
        if (this.keyListener.isKeyDown(KeyListener.KEY_N)) {
            this.makeItemFruit(true, true);
        }
    }
    update(delta) {
        this.spawnCounter++;
        for (const spider of this.spiders) {
            spider.update(delta);
        }
        this.fruits.forEach((fruit, i) => {
            fruit.update(delta);
            const isColliding = this.player.isCollidingFruit(fruit);
            if (isColliding) {
                if (fruit.agartha) {
                    this.inAgartha = true;
                    SoundManager.play('./assets/agarthasong.mp3', 1);
                    this.agarthaTimer = 15000;
                }
                this.score += fruit.getScore();
                if (!this.inAgartha) {
                    SoundManager.play('./assets/metal-pipe-clang.mp3', 1);
                }
                this.fruits.splice(i, 1);
            }
        });
        this.spiders.forEach((spider, i) => {
            spider.update(delta);
            const isColliding = this.player.isCollidingSpider(spider);
            if (isColliding) {
                this.score += spider.getScore();
                if (!this.inAgartha) {
                    SoundManager.play('./assets/fout.mp3', 1);
                }
                this.spiders.splice(i, 1);
            }
        });
        if (this.inAgartha) {
            this.agarthaTimer -= delta;
            if (this.agarthaTimer <= 0) {
                this.inAgartha = false;
            }
        }
        if (this.inAgartha) {
            this.makeItemFruit();
        }
        else {
            if (this.spawnCounter % 10 === 0) {
                if (Math.random() > 0.9) {
                    this.makeItemSpider();
                }
                else {
                    this.makeItemFruit();
                }
            }
        }
        return true;
    }
    render() {
        CanvasRenderer.clearCanvas(this.canvas);
        for (const spider of this.spiders) {
            spider.render(this.canvas);
        }
        for (const fruit of this.fruits) {
            fruit.render(this.canvas);
        }
        this.player.render(this.canvas);
        CanvasRenderer.writeText(this.canvas, `Score: ${this.score}`, 15, 30, 'left', 'arial', 24, 'white');
    }
}
//# sourceMappingURL=FruitDrop.js.map