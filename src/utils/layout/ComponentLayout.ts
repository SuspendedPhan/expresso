import type { ExObject } from "src/ex-object/ExObject";
import { ElementLayout } from "./ElementLayout";
import MainContext from "src/main-context/MainContext";

export default class ExObjectLayout {
  public static create(
    ctx: MainContext,
    rootExObject: ExObject
  ): ElementLayout {
    const childrenByExObject = new Map<ExObject, readonly ExObject[]>();
    
    ctx.eventBus.objectAdded$.subscribe((exObject) => {
      exObject.children$.subscribe((children) => {
        childrenByExObject.set(exObject, children);
      });
    });

    return new ElementLayout(
      () => rootExObject,
      (exObject) => this.getChildren(exObject, childrenByExObject),
      (exObject) => exObject.id,
      16,
      16
    );
  }

  static getChildren(exObject: ExObject, childrenByExObject: Map<ExObject, readonly ExObject[]>): readonly ExObject[] {
    return childrenByExObject.get(exObject) ?? [];
  }
}
