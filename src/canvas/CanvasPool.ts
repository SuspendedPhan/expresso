import deePool from "deepool";
import type { LibCanvasObject } from "src/canvas/Canvas";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("CanvasPool.ts");

export default class CanvasPool {
  private circlePool;
  private usedCircles = [] as any[]; 

  constructor(objectFactory: () => any) {
    this.circlePool = deePool.create(objectFactory);
    this.circlePool.grow(20);
  }

  public takeObject(): LibCanvasObject {
    const circle = this.circlePool.use();
    this.usedCircles.push(circle);
    return circle;
  }

  public releaseObject(circle: LibCanvasObject): void {
    this.circlePool.recycle(circle);
  }

  public log(): void {
    log55.debug("Used circles", this.usedCircles);
  }
}