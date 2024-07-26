import deePool from "deepool";
import type { SceneObject } from "./SceneContext";

export default class ScenePool {
  private circlePool;
  private usedCircles = [] as any[]; 

  constructor(objectFactory: () => any) {
    this.circlePool = deePool.create(objectFactory);
    this.circlePool.grow(20);
  }

  public takeObject(): SceneObject {
    const circle = this.circlePool.use();
    this.usedCircles.push(circle);
    return circle;
  }

  public releaseObject(circle: SceneObject): void {
    this.circlePool.recycle(circle);
  }
}