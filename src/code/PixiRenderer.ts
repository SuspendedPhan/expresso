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
      antialias: true,
    });
    this.circlePool.grow(10);
  }

  public render(evalOutput) {
    this.renderOrganism(evalOutput.getRootOrganism());
  }

  private renderOrganism(organismOutput) {
    const circle = this.circlePool.use();
    const cloneOutput = organismOutput.getCloneOutputByCloneNumber().get(0);
    const attributes = cloneOutput.getAttributes();
    let x, y;
    for (let i = 0; i < attributes.size(); i++) {
      const attribute = attributes.get(i);
      console.log(attribute.getName());
      if (attribute.getName() === 'x') {
        x = attribute.getValue();
      } else if (attribute.getName() === 'y') {
        y = attribute.getValue();
      }
    }
    circle.x = x;
    circle.y = y;
    circle.scale.x = 50;
    circle.scale.y = 50;
    this.circlePool.recycle(circle);
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