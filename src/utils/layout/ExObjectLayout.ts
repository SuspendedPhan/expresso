import { Effect } from "effect";
import { log5 } from "src/utils/utils/Log5";
import { ElementLayout } from "./ElementLayout";
import type { DexObject } from "src/DexDomain";

const log55 = log5("ExObjectLayout.ts");

export function createExObjectLayout(rootExObject: DexObject) {
  log55.debug("createExObjectLayout_");
  return Effect.gen(function* () {
    log55.debug("createExObjectLayout");

    function getChildren(exObject: DexObject) {
      return exObject.children;
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
