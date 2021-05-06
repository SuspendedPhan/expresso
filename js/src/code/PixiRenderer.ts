import * as PIXI from "pixi.js";
import deePool from "deepool";

export default class PixiRenderer {
  private app;
  private circlePool = deePool.create(() => this.makeCircle());
  private circles = [] as any[];

  constructor(viewportElement, canvasElement) {
    this.app = new PIXI.Application({
      resizeTo: viewportElement,
      view: canvasElement,
      antialias: true
    });
    this.circlePool.grow(10);
  }

  public render(evalOutput) {
    this.renderOrganism(evalOutput.getRootOrganism());
  }

  private renderOrganism(organismOutput) {
    const cloneOutputByCloneNumber = organismOutput.getCloneOutputByCloneNumber();
    const usedCircles: any = [];
    for (let i = 0; i < cloneOutputByCloneNumber.size(); i++) {
      const circle = this.circlePool.use();
      usedCircles.push(circle);

      const cloneOutput = cloneOutputByCloneNumber.get(i);
      const attributes = cloneOutput.getAttributes();
      let x, y;
      for (let i = 0; i < attributes.size(); i++) {
        const attribute = attributes.get(i);
        if (attribute.getName() === "x") {
          x = attribute.getValue();
        } else if (attribute.getName() === "y") {
          y = attribute.getValue();
        }
      }
      circle.x = x;
      circle.y = y;
      circle.scale.x = 2;
      circle.scale.y = 2;
    }

    for (const usedCircle of usedCircles) {
      this.circlePool.recycle(usedCircle);
    }
  }

  private makeCircle() {
    const ret = new PIXI.Graphics();
    ret.beginFill(0x9966ff);
    ret.drawCircle(0, 0, 1);
    ret.endFill();
    this.circles.push(ret);
    this.app.stage.addChild(ret);
    return ret;
  }
}