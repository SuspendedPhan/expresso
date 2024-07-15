import * as PIXI from "pixi.js";

export default class PixiFactory {
  private app;
  constructor(viewportElement: HTMLElement, canvasElement: PIXI.ICanvas) {
    this.app = new PIXI.Application();
    this.app.init({
      resizeTo: viewportElement,
      canvas: canvasElement,
      antialias: true,
    });

    const circle = this.makeCircle();
    circle.scale.x = 100;
    circle.scale.y = 100;
  }

  public makeCircle() {
    // prettier-ignore
    const ret = new PIXI.Graphics()
      .circle(0, 0, 1)
      .fill(0xffffff);

    this.app.stage.addChild(ret);
    return ret;
  }
}
