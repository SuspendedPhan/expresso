import { BehaviorSubject, firstValueFrom, of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import { ExItemType } from "src/ex-object/ExItem";
import { CreateExObject, type ExObject } from "src/ex-object/ExObject";
import { CreateProperty, type BasicProperty } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log3";
import type { OBS, SUB } from "src/utils/utils/Utils";

const log55 = log5("Component.ts");

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

export interface ComponentBase {
  id: string;
  itemType: ExItemType.Component;
  parent$: OBS<null>;
}

export interface CanvasComponent extends ComponentBase {
  componentKind: ComponentKind.CanvasComponent;
  parameters: CanvasComponentParameter[];
}

export interface CustomComponent extends ComponentBase {
  componentKind: ComponentKind.CustomComponent;
  name$: SUB<string>;
  parameters$: SUB<CustomComponentParameter[]>;
  rootExObjects$: SUB<ExObject[]>;
  properties$: SUB<BasicProperty[]>;

  addParameterBlank(): Promise<CustomComponentParameter>;
  addPropertyBlank(): Promise<BasicProperty>;
}

export interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly componentParameterKind: ComponentParameterKind.CanvasComponentParameter;
  readonly canvasSetter: CanvasSetter;
}

export interface CustomComponentParameter {
  readonly id: string;
  readonly componentParameterKind: ComponentParameterKind.CustomComponentParameter;
  readonly name$: SUB<string>;
}


export const CanvasComponentStore = {
  circle: {
    id: "circle",
    parent$: of(null),
    itemType: ExItemType.Component,
    componentKind: ComponentKind.CanvasComponent,
    parameters: [
      {
        componentParameterKind: ComponentParameterKind.CanvasComponentParameter,
        name: "x",
        id: "x",
        canvasSetter: (pixiObject, value) => {
          pixiObject.x = value;
        },
      },
    ],
  },
} satisfies Record<string, CanvasComponent>;

export function createComponentCtx(_ctx: MainContext) {
  const parameterById = new Map<string, CanvasComponentParameter>();
  CanvasComponentStore.circle.parameters.forEach((parameter) => {
    parameterById.set(parameter.id, parameter);
  });

  return {
    getCanvasComponentById(id: string) {
      const component = (CanvasComponentStore as any)[id];
      if (!component) {
        throw new Error(`Canvas component not found: ${id}`);
      }
      return component;
    },
    getCanvasComponentParameterById(id: string) {
      const parameter = parameterById.get(id);
      log55.debug("getCanvasComponentParameterById", id, parameter);

      if (!parameter) {
        throw new Error(`Canvas component parameter not found: ${id}`);
      }
      return parameter;
    },
  };
}

export async function createCustomComponentParameter(
  _ctx: MainContext,
  data: {
    id?: string;
    name?: string;
  }
): Promise<CustomComponentParameter> {
  return {
    componentParameterKind: ComponentParameterKind.CustomComponentParameter,
    id: data.id ?? `custom-component-parameter-${crypto.randomUUID()}`,
    name$: new BehaviorSubject(data.name ?? "Parameter"),
  };
}

export namespace CreateComponent {
  export async function custom(
    ctx: MainContext,
    data: {
      id?: string;
      name?: string;
      parameters?: CustomComponentParameter[];
      rootExObjects?: ExObject[];
      properties?: BasicProperty[];
    }
  ): Promise<CustomComponent> {
    if (data.name === undefined) {
      const ordinal = await ctx.projectCtx.getOrdinalProm();
      data.name = `Component ${ordinal}`;
    }

    const component: CustomComponent = {
      id: data.id ?? `custom-component-${crypto.randomUUID()}`,
      itemType: ExItemType.Component,
      parent$: of(null),
      componentKind: ComponentKind.CustomComponent,
      name$: new BehaviorSubject(data.name),
      parameters$: new BehaviorSubject(data.parameters ?? []),
      rootExObjects$: new BehaviorSubject(data.rootExObjects ?? []),
      properties$: new BehaviorSubject(data.properties ?? []),

      async addParameterBlank() {
        const parameter = await createCustomComponentParameter(ctx, {});
        const parameters = await firstValueFrom(component.parameters$);
        this.parameters$.next([...parameters, parameter]);
        return parameter;
      },

      async addPropertyBlank() {
        const property = await CreateProperty.basicBlank(ctx);
        const properties = await firstValueFrom(component.properties$);
        this.properties$.next([...properties, property]);
        return property;
      },
    };
    return component;
  }
}

export namespace ComponentParameterFns {
  export function getName$(
    componentParameter: ComponentParameter
  ): OBS<string> {
    switch (componentParameter.componentParameterKind) {
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
    const exObject = await CreateExObject.blank(_ctx, {});
    const rootExObjects = await firstValueFrom(component.rootExObjects$);
    component.rootExObjects$.next([...rootExObjects, exObject]);
  }
}
