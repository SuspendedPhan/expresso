import { Effect } from "effect";
import { ExObject } from "src/ex-object/ExObject";
import { log5 } from "src/utils/utils/Log5";
import { ElementLayout } from "./ElementLayout";

const log55 = log5("ExObjectLayout.ts");

export function createExObjectLayout(rootExObject: ExObject) {
  log55.debug("createExObjectLayout_");
  return Effect.gen(function* () {
    log55.debug("createExObjectLayout");

    function getChildren(exObject: ExObject) {
      return exObject.children.items;
    }

    return new ElementLayout(
      () => rootExObject,
      (exObject) => getChildren(exObject),
      (exObject) => exObject.id,
      16,
      16
    );
  });
}
