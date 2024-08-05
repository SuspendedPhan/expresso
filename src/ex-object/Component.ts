import type { SceneObject } from "src/scene/SceneContext";
import type { SUB } from "src/utils/utils/Utils";

export type SceneSetter = (sceneObject: SceneObject, value: number) => void;

export type Component = SceneComponent | CustomComponent;
export type ComponentParameter = SceneComponentParameter | CustomComponentParameter;
export enum ComponentType {
  SceneComponent,
  CustomComponent,
}

export interface SceneComponent {
  id: string;
  componentType: ComponentType.SceneComponent;
  parameters: SceneComponentParameter[];
}

export interface CustomComponent {
  id: string;
  componentType: ComponentType.CustomComponent;
  name$: SUB<string>;
  parameters$: SUB<ComponentParameter[]>;
}

export interface SceneComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly sceneSetter: SceneSetter;
}

export interface CustomComponentParameter {
  readonly id: string;
  readonly nameSub$: SUB<string>;
}

export const SceneComponentStore = {
  circle: {
    id: "circle",
    componentType: ComponentType.SceneComponent,
    parameters: [
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

export namespace CreateComponent {
  export function component() {

  }
}