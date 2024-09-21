import { Effect } from "effect";
import { ExObject } from "src/ex-object/ExObject";
import { log5 } from "src/utils/utils/Log5";
import { ElementLayout } from "./ElementLayout";
import { Project, ProjectFactory } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import assert from "assert-ts";
import { isType } from "variant";

const log55 = log5("ExObjectLayout.ts");

export function createExObjectLayout(rootExObject: ExObject) {
  log55.debug("createExObjectLayout_");
  return Effect.gen(function* () {
    log55.debug("createExObjectLayout");

    const childrenByExObject = new Map<ExObject, readonly ExObject[]>();

    function getChildren(exObject: ExObject) {
      return childrenByExObject.get(exObject) ?? [];
    }

    const project = yield* EffectUtils.firstValueFrom(rootExObject.parent$);
    assert(isType(project, ProjectFactory));

    project.exObjects.events$.subscribe((event) => {
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
