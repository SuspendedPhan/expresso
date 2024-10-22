import { HashMap, Option } from "effect";
import { type WritableDraft } from "immer";
import { DexId } from "./DexId";
import { DexNode } from "./DexNode";
import { DexObject, type DexProject } from "./Domain";

export namespace DexReducer {
  export type DexReducer<T> = (state: WritableDraft<T>) => void;

  export const DexObject = {
    addBlankChild: DexObject_addBlankChild,
  };
}

function DexObject_addBlankChild(parent: DexObject) {
  return (project: WritableDraft<DexProject>) => {
    const rootDexObjects = project.dexObjects;
    const dexObjects = rootDexObjects.flatMap((o) => Array.from(DexNode.traverse<WritableDraft<DexObject>>(o)));

    const dexObjectById = DexId.makeValueByIdMap(dexObjects);
    const dParent = HashMap.get(dexObjectById, parent.id);
    const dParent2 = Option.getOrThrow(dParent);
    const newChild = DexObject({
      id: DexId.make(),
      name: "New Object",
      children: [],
    });
    dParent2.children.push(newChild);
  };
}

