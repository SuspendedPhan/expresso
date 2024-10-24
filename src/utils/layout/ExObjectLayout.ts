import type { DexObject } from "src/DexDomain";
import { ElementLayout } from "./ElementLayout";

export function createExObjectLayout(rootExObject: DexObject) {
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
}
