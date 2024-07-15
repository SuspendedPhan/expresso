import * as PIXI from "pixi.js";

export default class PixiFactory {
  private app;
  constructor(viewportElement: HTMLElement, canvasElement: PIXI.ICanvas) {
    this.app = new PIXI.Application({
      resizeTo: viewportElement,
      view: canvasElement,
      antialias: true
    });
  }

  public makeCircle() {
    const ret = new PIXI.Graphics();
    ret.beginFill(0xffffff);
    ret.drawCircle(0, 0, 1);
    ret.endFill();
    this.app.stage.addChild(ret);
    return ret;
  }
}