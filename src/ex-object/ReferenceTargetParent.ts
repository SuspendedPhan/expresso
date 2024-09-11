import { ComponentFactory } from "src/ex-object/Component";
import { CustomExFuncFactory } from "src/ex-object/ExFunc";
import { ExObjectFactory } from "src/ex-object/ExObject";
import { variant } from "variant";

export const ReferenceTargetParent = variant([
    ExObjectFactory,
    ComponentFactory.Custom,
    CustomExFuncFactory,
  ]);