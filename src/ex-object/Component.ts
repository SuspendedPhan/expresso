import { of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import type { ExObject } from "src/ex-object/ExObject";
import type { OBS, SUB } from "src/utils/utils/Utils";

export type CanvasSetter = (
  canvasObject: LibCanvasObject,
  value: number
) => void;

export type Component = CanvasComponent | CustomComponent;
export type ComponentParameter =
  | CanvasComponentParameter
  | CustomComponentParameter;
export enum ComponentType {
  CanvasComponent,
  CustomComponent,
}

export enum ComponentParameterType {
  CanvasComponentParameter,
  CustomComponentParameter,
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
  rootExObjects$: SUB<ExObject[]>;
}

export interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly componentParameterType: ComponentParameterType.CanvasComponentParameter;
  readonly canvasSetter: CanvasSetter;
}

export interface CustomComponentParameter {
  readonly id: string;
  readonly componentParameterType: ComponentParameterType.CustomComponentParameter;
  readonly nameSub$: SUB<string>;
}

export const CanvasComponentStore = {
  circle: {
    id: "circle",
    componentType: ComponentType.CanvasComponent,
    parameters: [
      {
        componentParameterType: ComponentParameterType.CanvasComponentParameter,
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
  export function component() {}
}

export namespace ComponentParameterUtils {
  export function getName$(
    componentParameter: ComponentParameter
  ): OBS<string> {
    switch (componentParameter.componentParameterType) {
      case ComponentParameterType.CanvasComponentParameter:
        return of(componentParameter.name);
      case ComponentParameterType.CustomComponentParameter:
        return componentParameter.nameSub$;
      default:
        throw new Error("unknown component parameter type");
    }
  }
}

export namespace ComponentUtils {
  export function getName$(component: Component): OBS<string> {
    switch (component.componentType) {
      case ComponentType.CanvasComponent:
        return of(component.id);
      case ComponentType.CustomComponent:
        return component.name$;
      default:
        throw new Error("unknown component type");
    }
  }
}