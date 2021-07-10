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
    this.circlePool.grow(20);
  }

  public render(evalOutput) {
    for (const circle of this.circles) {
      circle.visible = false;
    }

    const usedCircles = this.renderOrganism(evalOutput.getRootOrganism());
    for (const usedCircle of usedCircles) {
      this.circlePool.recycle(usedCircle);
    }
  }

  private renderOrganism(organismOutput) {
    const cloneOutputByCloneNumber = organismOutput.getCloneOutputByCloneNumber();
    let usedCircles: any = [];
    const size = cloneOutputByCloneNumber.size();
    for (let i = 0; i < size; i++) {
      const circle = this.circlePool.use();
      usedCircles.push(circle);

      const cloneOutput = cloneOutputByCloneNumber.get(i);
      const attributes = cloneOutput.getAttributes();
      let x, y;
      let radius = 20;
      for (let i = 0; i < attributes.size(); i++) {
        const attribute = attributes.get(i);
        if (attribute.getName() === "x") {
          x = attribute.getValue();
        } else if (attribute.getName() === "y") {
          y = attribute.getValue();
        } else if (attribute.getName() === "radius") {
          radius = attribute.getValue();
        }
      }
      circle.x = x;
      circle.y = y;
      circle.scale.x = radius;
      circle.scale.y = radius;
      circle.visible = true;

      const suborganismOutputs = cloneOutput.getSuborganisms();
      for (let j = 0; j < suborganismOutputs.size(); j++) {
        const suborganismOutput = suborganismOutputs.get(j);
        usedCircles = usedCircles.concat(this.renderOrganism(suborganismOutput));
      }
    }

    return usedCircles;
  }

  public static jsifyEvalOutput(evalOutput) {
    return this.jsifyOrganismOutput(evalOutput.getRootOrganism());
  }

  private static jsifyOrganismOutput(organismOutput) {
    const cloneOutputByCloneNumber = organismOutput.getCloneOutputByCloneNumber();
    const result = [] as any;
    for (let i = 0; i < cloneOutputByCloneNumber.size(); i++) {
      const cloneOutput = cloneOutputByCloneNumber.get(i);
      result.push(this.jsifyCloneOutput(cloneOutput));
    }
    return result;
  }

  private static jsifyCloneOutput(cloneOutput) {
    const result = {
      attributes: [] as any,
      suborganisms: [] as any,
    };
    const attributes = cloneOutput.getAttributes();
    for (let i = 0; i < attributes.size(); i++) {
      result.attributes.push(this.jsifyAttribute(attributes.get(i)));
    }
    const suborganismOutputs = cloneOutput.getSuborganisms();
    for (let i = 0; i < suborganismOutputs.size(); i++) {
      result.suborganisms.push(this.jsifyOrganismOutput(suborganismOutputs.get(i)));
    }
    return result;
  }

  private static jsifyAttribute(attribute) {
    return attribute.getName() + " | " + attribute.getValue();
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