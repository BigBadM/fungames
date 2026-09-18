import CanvasRenderer from './CanvasRenderer.js';
import ScoreItem from './ScoreItems.js';

export default class Fruit extends ScoreItem {
  private speed: number;

  public agartha: boolean = false;

  public constructor(maxX: number, allowAgartha: boolean = true, forceSpecial: boolean = false) {
    super();
    this.posX = 0;
    this.posY = 0;
    this.score = 0;
    this.speed = 0.3;

    // choose a random image for the fruit
    const random: number = Math.random();
    if (forceSpecial || (allowAgartha && random > 0.9999)) {
      this.image = CanvasRenderer.loadNewImage('./assets/monster.ico');
      this.score = 100;
      this.agartha = true;
    } else if (random > 0.9) {
      this.image = CanvasRenderer.loadNewImage('./assets/needle.png');
      this.score = 10;
    } else if (random > 0.7) {
      this.image = CanvasRenderer.loadNewImage('./assets/chicken.png');
      this.score = 7;
    } else if (random > 0.4) {
      this.image = CanvasRenderer.loadNewImage('./assets/basketball.png');
      this.score = 5;
    } else if (random > 0.2) {
      this.image = CanvasRenderer.loadNewImage('./assets/watermelon.png');
      this.score = 3;
    } else {
      this.image = CanvasRenderer.loadNewImage('./assets/fruit-banana.png');
      this.score = 1;
    }
    // random spawn
    this.posX = (Math.random() * maxX);
    this.posY = -32;
  }

  /**
   * ESlint req
   * @param delta previous frame * 0.15
   */
  public update(delta: number): void {
    // Move down based on elapsed time and current speed, then slowly accelerate
    this.posY += delta * 0.15 * this.speed;
    this.speed += 0.02;
  }

  /**
   * ESlint req
   * @param canvas tja canvas gekke shit
   */

}
