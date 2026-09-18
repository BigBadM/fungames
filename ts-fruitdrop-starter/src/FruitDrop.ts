import Game from './Game.js';
import Spider from './Spider.js';
import Fruit from './Fruit.js';
import Player from './Player.js';
import CanvasRenderer from './CanvasRenderer.js';
import KeyListener from './keyListener.js';
import SoundManager from './soundManager.js';

export default class FruitDrop extends Game {
  private canvas: HTMLCanvasElement;

  private spiders: Spider[];

  private inAgartha: boolean = false;

  private agarthaTimer: number = 0;

  private nextItem: number;

  private score: number = 0;

  private fruits: Fruit[];

  private keyListener: KeyListener;

  private player: Player;

  private spawnCounter: number = 0;

  public constructor(canvas: HTMLCanvasElement) {
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

  private makeItemSpider(): void{
    this.spiders.push(new Spider(this.canvas.width));
  }

  private makeItemFruit(allowAgartha: boolean = true, forceSpecial: boolean = false): void {
    this.fruits.push(new Fruit(this.canvas.width, allowAgartha, forceSpecial));
  }

  /**
   * Process all input. Called from the GameLoop.
   */
  public processInput(): void {
    if(this.keyListener.isKeyDown(KeyListener.KEY_LEFT)) {
      this.player.moveLeft();
      this.player.update(10);
    }
    if(this.keyListener.isKeyDown(KeyListener.KEY_RIGHT)) {
      this.player.moveRight();
      this.player.update(10);
    }
    if (this.keyListener.isKeyDown(KeyListener.KEY_N)) {
        this.makeItemFruit(true, true);
    }
  }

  /**
   * Update game state. Called from the GameLoop
   *
   * @param elapsed time in ms elapsed from the GameLoop
   * @returns true if the game should continue
   */
  public update(delta: number): boolean {

    this.spawnCounter++;

    // 1. Update spiders
    for (const spider of this.spiders) {
        spider.update(delta);
    }

    // 2. Update fruits + collisions
    this.fruits.forEach((fruit: Fruit, i: number) => {
        fruit.update(delta);

        const isColliding: boolean = this.player.isCollidingFruit(fruit);

        if (isColliding) {

            // AGARTHA ACTIVATES HERE
            if (fruit.agartha) {
                this.inAgartha = true;
                SoundManager.play('./assets/agarthasong.mp3', 1);
                this.agarthaTimer = 15000; // 15 seconds
            }

            this.score += fruit.getScore();
            if (!this.inAgartha) {
              SoundManager.play('./assets/metal-pipe-clang.mp3', 1);
            }

            this.fruits.splice(i, 1);
        }
    });

    this.spiders.forEach((spider: Spider, i: number) => {
        spider.update(delta);

        const isColliding: boolean = this.player.isCollidingSpider(spider);

        if (isColliding) {
            this.score += spider.getScore();
            if (!this.inAgartha) {
              SoundManager.play('./assets/fout.mp3', 1);
            }

            this.spiders.splice(i, 1);
        }
    });

    // 3. Handle AGARTHA timer
    if (this.inAgartha) {
        this.agarthaTimer -= delta;
        if (this.agarthaTimer <= 0) {
            this.inAgartha = false;
        }
    }

    // 4. NOW: Spawn after collisions + after agartha update
    if (this.inAgartha) {

        // Agartha mode spawns ONLY fruit, and very fast
        this.makeItemFruit();

    } else {

        // Normal slow spawn
        if (this.spawnCounter % 10 === 0) {
            if (Math.random() > 0.9) {
                this.makeItemSpider();
            } else {
                this.makeItemFruit();
            }
        }
    }

    return true;
}







  /**
   * Render all the elements in the screen.
   */
  public render(): void {
    // Clear the canvas
    CanvasRenderer.clearCanvas(this.canvas);

    for (const spider of this.spiders) {
      spider.render(this.canvas);
    }

    for (const fruit of this.fruits) {
      fruit.render(this.canvas);
    }
    // todo render player
    this.player.render(this.canvas);

    CanvasRenderer.writeText(this.canvas, `Score: ${this.score}`, 15, 30, 'left', 'arial', 24, 'white');
  }
}
