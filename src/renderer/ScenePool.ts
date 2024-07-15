// @ts-nocheck

import * as PIXI from "pixi.js";

import deePool from "deepool";

export default class ScenePool {
  private circlePool;
  private usedCircles = [] as any[]; 

  constructor(objectFactory: () => any) {
    this.circlePool = deePool.create(objectFactory);
    this.circlePool.grow(20);
  }

  public takeCircle() {
    const circle = this.circlePool.use();
    this.usedCircles.push(circle);
    return circle;
  }

  public releaseCircle(circle) {
    this.circlePool.recycle(circle);
  }
}