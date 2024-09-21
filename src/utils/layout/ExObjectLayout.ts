import assert from "assert-ts";
import { Effect, Stream } from "effect";
import { ExObject } from "src/ex-object/ExObject";
import { ProjectFactory } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import { isType } from "variant";
import { ElementLayout } from "./ElementLayout";

const log55 = log5("ExObjectLayout.ts");

export function createExObjectLayout(rootExObject: ExObject) {
  log55.debug("createExObjectLayout_");
  return Effect.gen(function* () {
    log55.debug("createExObjectLayout");

    const childrenByExObject = new Map<ExObject, readonly ExObject[]>();

    function getChildren(exObject: ExObject) {
      return childrenByExObject.get(exObject) ?? [];
    }

    // TODP: fix this to match ExprLayout.ts

    const project = yield* EffectUtils.firstValueFrom(rootExObject.parent$);
    assert(isType(project, ProjectFactory));

    yield* Effect.forkDaemon(
      Stream.runForEach(yield* project.exObjectEvents, (value) => {
        return Effect.gen(function* () {
          if (value.type !== "ItemAdded") {
            return;
          }

          const exObject = value.item;
          exObject.children$.subscribe((children) => {
            childrenByExObject.set(exObject, children);
          });
        });
      })
    );

    return new ElementLayout(
      () => rootExObject,
      (exObject) => getChildren(exObject),
      (exObject) => exObject.id,
      16,
      16
    );
  });
}
