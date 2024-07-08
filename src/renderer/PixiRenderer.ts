import * as PIXI from "pixi.js";
import deePool from "deepool";

export default class PixiRenderer {
  private app;
  public circlePool = deePool.create(() => this.makeCircle());
  public circles = [] as any[];

  constructor(viewportElement: any, canvasElement: any) {
    this.app = new PIXI.Application({
      resizeTo: viewportElement,
      view: canvasElement,
      antialias: true
    });
    this.circlePool.grow(20);
  }

  private makeCircle() {
    const ret = new PIXI.Graphics();
    ret.beginFill(0xffffff);
    // ret.beginFill(0x9966ff);
    ret.drawCircle(0, 0, 1);
    ret.endFill();
    this.circles.push(ret);
    this.app.stage.addChild(ret);
    return ret;
  }
}