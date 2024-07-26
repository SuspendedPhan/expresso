import type { ExItemBase } from "src/ex-object/ExItem";
import type { SUB } from "src/utils/utils/Utils";

export type Component = SceneComponent | CustomComponent;
export type ComponentInput = SceneComponentInput | CustomComponentInput;
export enum ComponentType {
  SceneComponent,
  CustomComponent,
}

export interface ComponentBase extends ExItemBase {
  children$: SUB<Component[]>;
}

export interface SceneComponent extends ComponentBase {
  componentType: ComponentType.SceneComponent;
  inputs: ComponentInput[];
}

export interface CustomComponent extends ComponentBase{
  componentType: ComponentType.CustomComponent;
  name$: SUB<string>;
  inputs$: SUB<ComponentInput[]>;
}

export interface SceneComponentInput {
  readonly id: string;
  readonly name: string;
}

export interface CustomComponentInput {
  readonly id: string;
  readonly nameSub$: SUB<string>;
}

export const SceneComponentStore = {
  circle: {
    inputs: [
      { name: "x", id: "x" },
    ],
  },
};