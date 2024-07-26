import type { SceneObject } from "src/scene/SceneContext";
import type { SUB } from "src/utils/utils/Utils";

type SceneSetter = (sceneObject: SceneObject, value: number) => void;

export type Component = SceneComponent | CustomComponent;
export type ComponentInput = SceneComponentInput | CustomComponentInput;
export enum ComponentType {
  SceneComponent,
  CustomComponent,
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
  readonly sceneSetter: SceneSetter;
}

export interface CustomComponentInput {
  readonly id: string;
  readonly nameSub$: SUB<string>;
}

export const SceneComponentStore = {
  circle: {
    componentType: ComponentType.SceneComponent,
    inputs: [
      {
        name: "x",
        id: "x",
        sceneSetter: (pixiObject, value) => {
          pixiObject.x = value;
        },
      },
    ],
  },
} satisfies Record<string, SceneComponent>;
