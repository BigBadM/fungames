import CanvasRenderer from './CanvasRenderer.js';

export default abstract class ScoreItem {
  protected image: HTMLImageElement;

  protected posX: number;

  protected posY: number;

  protected score: number;

  public constructor() {
    this.posX = 0;
    this.posY = 0;
    this.score = 0;
    this.image = new Image();
  }

  public abstract update(delta: number): void;

  public getPosX(): number {
    return this.posX;
  }

  public getPosY(): number {
    return this.posY;
  }

  public render(canvas: HTMLCanvasElement): void {
    CanvasRenderer.drawImage(canvas, this.image, this.posX, this.posY);
  }

  public getWidth(): number {
    return this.image.width;
  }

  public getHeight(): number {
    return this.image.height;
  }

  public getScore(): number {
    return this.score;
  }
}
