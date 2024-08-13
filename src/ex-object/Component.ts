import { BehaviorSubject, firstValueFrom, of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import { CreateExObject, type ExObject } from "src/ex-object/ExObject";
import { ProjectFns } from "src/ex-object/Project";
import type MainContext from "src/main-context/MainContext";
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
  export async function customBlank(ctx: MainContext): Promise<CustomComponent> {
    const project = await firstValueFrom(ctx.projectManager.currentProject$);
    const ordinal = await ProjectFns.getAndIncrementOrdinal(project);
    const id = `custom-${crypto.randomUUID()}`;
    return {
      id,
      componentType: ComponentType.CustomComponent,
      name$: new BehaviorSubject(`Component ${ordinal}`),
      parameters$: new BehaviorSubject<ComponentParameter[]>([]),
      rootExObjects$: new BehaviorSubject<ExObject[]>([]),
    };
  }
}

export namespace ComponentParameterFns {
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

export namespace ComponentFns {
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

  export async function addRootExObjectBlank(
    _ctx: MainContext,
    component: CustomComponent,
  ): Promise<void> {
    const exObject = await CreateExObject.blank(_ctx);
    const rootExObjects = await firstValueFrom(component.rootExObjects$);
    component.rootExObjects$.next([...rootExObjects, exObject]);
  }
}