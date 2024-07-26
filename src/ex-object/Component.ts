import type { CustomComponentInput, SceneComponentInput } from "src/ex-object/ComponentInput";
import type { SUB } from "src/utils/utils/Utils";

export type Component = SceneComponent | CustomComponent;

export interface SceneComponent {
  inputs: SceneComponentInput[];
}

export interface CustomComponent {
  nameSub$: SUB<string>;
  inputSub$: SUB<CustomComponentInput[]>;
}
