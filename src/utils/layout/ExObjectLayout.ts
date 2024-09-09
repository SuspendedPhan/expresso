import { ExObject } from "src/ex-object/ExObject";
import { ElementLayout } from "./ElementLayout";
import { Effect } from "effect";
import { ExObjectCtx } from "src/ctx/ExObjectCtx";

export function createExObjectLayout(rootExObject: ExObject) {
  return Effect.gen(function* () {
    const childrenByExObject = new Map<ExObject, readonly ExObject[]>();

    function getChildren(exObject: ExObject) {
      return childrenByExObject.get(exObject) ?? [];
    }

    (yield* ExObjectCtx.exObjects).events$.subscribe((event) => {
      if (event.type !== "ItemAdded") {
        return;
      }

      const exObject = event.item;
      exObject.children$.subscribe((children) => {
        childrenByExObject.set(exObject, children);
      });
    });
    
    return new ElementLayout(
      () => rootExObject,
      (exObject) => getChildren(exObject),
      (exObject) => exObject.id,
      16,
      16
    );
  });
}
