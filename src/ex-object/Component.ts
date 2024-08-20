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

export enum ComponentKind {
  CanvasComponent,
  CustomComponent,
}

export enum ComponentParameterKind {
  CanvasComponentParameter,
  CustomComponentParameter,
}

export interface CanvasComponent {
  id: string;
  componentKind: ComponentKind.CanvasComponent;
  parameters: CanvasComponentParameter[];
}

export interface CustomComponent {
  id: string;
  componentKind: ComponentKind.CustomComponent;
  name$: SUB<string>;
  parameters$: SUB<CustomComponentParameter[]>;
  rootExObjects$: SUB<ExObject[]>;
}

export interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly componentParameterType: ComponentParameterKind.CanvasComponentParameter;
  readonly canvasSetter: CanvasSetter;
}

export interface CustomComponentParameter {
  readonly id: string;
  readonly componentParameterType: ComponentParameterKind.CustomComponentParameter;
  readonly name$: SUB<string>;
}

export const CanvasComponentStore = {
  circle: {
    id: "circle",
    componentKind: ComponentKind.CanvasComponent,
    parameters: [
      {
        componentParameterType: ComponentParameterKind.CanvasComponentParameter,
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
  export async function customBlank(
    ctx: MainContext
  ): Promise<CustomComponent> {
    const rootExObjects: ExObject[] = [];
    return await customFrom(ctx, rootExObjects);
  }

  export async function customFrom(
    ctx: MainContext,
    rootExObjects: ExObject[]
  ): Promise<CustomComponent> {
    const project = await firstValueFrom(ctx.projectManager.currentProject$);
    const ordinal = await ProjectFns.getAndIncrementOrdinal(project);
    const id = `custom-${crypto.randomUUID()}`;
    return {
      id,
      componentKind: ComponentKind.CustomComponent,
      name$: new BehaviorSubject(`Component ${ordinal}`),
      parameters$: new BehaviorSubject<CustomComponentParameter[]>([]),
      rootExObjects$: new BehaviorSubject<ExObject[]>(rootExObjects),
    };
  }
}

export namespace ComponentParameterFns {
  export function getName$(
    componentParameter: ComponentParameter
  ): OBS<string> {
    switch (componentParameter.componentParameterType) {
      case ComponentParameterKind.CanvasComponentParameter:
        return of(componentParameter.name);
      case ComponentParameterKind.CustomComponentParameter:
        return componentParameter.name$;
      default:
        throw new Error("unknown component parameter type");
    }
  }
}

export namespace ComponentFns {
  export function getName$(component: Component): OBS<string> {
    switch (component.componentKind) {
      case ComponentKind.CanvasComponent:
        return of(component.id);
      case ComponentKind.CustomComponent:
        return component.name$;
      default:
        throw new Error("unknown component type");
    }
  }

  export async function addRootExObjectBlank(
    _ctx: MainContext,
    component: CustomComponent
  ): Promise<void> {
    const exObject = await CreateExObject.blank(_ctx, {
      component,
    });
    const rootExObjects = await firstValueFrom(component.rootExObjects$);
    component.rootExObjects$.next([...rootExObjects, exObject]);
  }
}
