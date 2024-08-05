import type { LibCanvasObject } from "src/canvas/CanvasContext";
import type { SUB } from "src/utils/utils/Utils";

export type CanvasSetter = (canvasObject: LibCanvasObject, value: number) => void;

export type Component = CanvasComponent | CustomComponent;
export type ComponentParameter = CanvasComponentParameter | CustomComponentParameter;
export enum ComponentType {
  CanvasComponent,
  CustomComponent,
}

export interface CanvasComponent {
  id: string;
  componentType: ComponentType.CanvasComponent;
  parameters: CanvasComponentParameter[];
}

export interface CustomComponent {
  id: string;
  componentType: ComponentType.CustomComponent;
  name$: SUB<string>;
  parameters$: SUB<ComponentParameter[]>;
}

export interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly canvasSetter: CanvasSetter;
}

export interface CustomComponentParameter {
  readonly id: string;
  readonly nameSub$: SUB<string>;
}

export const CanvasComponentStore = {
  circle: {
    id: "circle",
    componentType: ComponentType.CanvasComponent,
    parameters: [
      {
        name: "x",
        id: "x",
        canvasSetter: (pixiObject, value) => {
          pixiObject.x = value;
        },
      },
    ],
  },
} satisfies Record<string, CanvasComponent>;

export namespace CreateComponent {
  export function component() {

  }
}