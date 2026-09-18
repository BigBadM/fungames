import CanvasRenderer from './CanvasRenderer.js';
import Fruit from './Fruit.js';
import Spider from './Spider.js';

export default class Player {
  private image: HTMLImageElement;

  private posX: number;

  private posY: number;

  private maxX: number;

  private speed: number = 2;

  private movingLeft: boolean = false;

  private movingRight: boolean = false;

  public constructor (maxX: number, maxY: number) {
    this.image = CanvasRenderer.loadNewImage('./assets/droid.png');
    this.maxX = maxX;
    this.posX = (maxX / 2) - (this.image.width / 2);
    this.posY = maxY - this.image.height;
  }

  public moveLeft(): void {
    this.movingLeft = true;
  }

  public moveRight(): void {
    this.movingRight = true;
  }

  public isCollidingFruit(fruit: Fruit): boolean {
    if (this.posX < fruit.getPosX() + fruit.getWidth() &&
      this.posX + this.getWidth() > fruit.getPosX() &&
      this.posY < fruit.getPosY() + fruit.getHeight() &&
      this.posY + this.getHeight() > fruit.getPosY()) {
      return true;
    } else {
      return false;
    }
  }

  public isCollidingSpider(spider: Spider): boolean {
    if (this.posX < spider.getPosX() + spider.getWidth() &&
      this.posX + this.getWidth() > spider.getPosX() &&
      this.posY < spider.getPosY() + spider.getHeight() &&
      this.posY + this.getHeight() > spider.getPosY()) {
      return true;
    } else {
      return false;
    }
  }

  public update(delta: number): void {
    if(this.movingLeft) {
      this.posX -= delta * 0.5 * this.speed;
      this.movingLeft = false;
    }
    if(this.movingRight) {
      this.posX += delta * 0.5 * this.speed;
      this.movingRight = false;
    }
  }

  public render(canvas: HTMLCanvasElement): void {
    CanvasRenderer.drawImage(canvas, this.image, this.posX, this.posY);
  }

  public getPosX(): number {
    return this.posX;
  }

  public getPosY(): number {
    return this.posY;
  }

  public getWidth(): number {
    return this.image.width;
  }

  public getHeight(): number {
    return this.image.height;
  }
}
