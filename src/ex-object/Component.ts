import type { SUB } from "src/utils/utils/Utils";

export type Component = SceneComponent | CustomComponent;
export type ComponentInput = SceneComponentInput | CustomComponentInput;
export enum ComponentType {
  SceneComponent,
  CustomComponent,
}

export interface ComponentBase {
  
}

export interface SceneComponent {
  componentType: ComponentType.SceneComponent;
  inputs: ComponentInput[];
}

export interface CustomComponent {
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