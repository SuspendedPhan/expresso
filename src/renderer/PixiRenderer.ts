import * as PIXI from "pixi.js";

import deePool from "deepool";

export default class PixiRenderer {
  private app;
  private circlePool = deePool.create(() => this.makeCircle());
  private circles = [] as any[];
  private usedCircles = [] as any[]; 

  constructor(viewportElement: any, canvasElement: any) {
    this.app = new PIXI.Application({
      resizeTo: viewportElement,
      view: canvasElement,
      antialias: true
    });
    this.circlePool.grow(20);
  }

  public takeCircle() {
    const circle = this.circlePool.use();
    this.usedCircles.push(circle);
    return circle;
  }

  public releaseCircles() {
    for (const circle of this.usedCircles) {
      this.circlePool.recycle(circle);
    }
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