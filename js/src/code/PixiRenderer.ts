import * as PIXI from "pixi.js";
import deePool from "deepool";

// TODO: rename to PixiManager in a separate commit
export default class PixiRenderer {
  private app : PIXI.Application;

  constructor(viewportElement, canvasElement) {
    this.app = new PIXI.Application({
      resizeTo: viewportElement,
      view: canvasElement,
      antialias: true
    });
  }

  public makeCircle() : PIXI.Graphics {
    const ret = new PIXI.Graphics();
    ret.beginFill(0xffffff);
    ret.drawCircle(0, 0, 1);
    ret.endFill();
    this.app.stage.addChild(ret);
    return ret;
  }

  public destroyCircle(circle : PIXI.Graphics) {
    this.app.stage.removeChild(circle);
    circle.destroy();
  }
}