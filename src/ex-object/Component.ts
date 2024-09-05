import { BehaviorSubject, firstValueFrom, of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import { CreateExObject, type ExObject } from "src/ex-object/ExObject";
import { Property, type PropertyKind } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import { Utils, type OBS, type SUB } from "src/utils/utils/Utils";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, variant, type VariantOf } from "variant";

const log55 = log5("Component.ts");

export type CanvasSetter = (
  canvasObject: LibCanvasObject,
  value: number
) => void;

interface ComponentBase {
  id: string;
  parent$: OBS<null>;
}

interface CanvasComponent extends ComponentBase {
  parameters: ComponentParameterKind["Canvas"][];
}

interface CustomComponent extends ComponentBase {
  name$: SUB<string>;
  parameters$: SUB<CustomComponentParameter[]>;
  rootExObjects$: SUB<ExObject[]>;
  properties$: SUB<PropertyKind["BasicProperty"][]>;

  addParameterBlank(): Promise<CustomComponentParameter>;
  addPropertyBlank(): Promise<PropertyKind["BasicProperty"]>;
}

interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly canvasSetter: CanvasSetter;
}

interface CustomComponentParameter {
  readonly id: string;
  readonly name$: SUB<string>;
}

export interface ComponentParameterCreationArgs {
  CustomComponentParameter: {
    id?: string;
    name?: string;
  };
}

export const ComponentParameter = {
  creators: variant({
    Canvas: fields<CanvasComponentParameter>(),
    Custom: fields<CustomComponentParameter>(),
  }),

  creators2: {
    async Custom(creationArgs: ComponentParameterCreationArgs["CustomComponentParameter"]) {
      const creationArgs2: Required<ComponentParameterCreationArgs["CustomComponentParameter"]> = {
        id: creationArgs.id ?? Utils.createId("custom-component-parameter"),
        name: creationArgs.name ?? "Parameter",
      };
      const parameter: CustomComponentParameter = {
        id: creationArgs2.id,
        name$: new BehaviorSubject(creationArgs2.name),
      };
      return parameter;
    }
  },
};

export type ComponentParameter = VariantOf<typeof ComponentParameter.creators>;
export type ComponentParameterKind = DexVariantKind<typeof ComponentParameter.creators>;

export interface ComponentCreationArgs {
  Custom: {
    id?: string;
    name?: string;
    parameters?: CustomComponentParameter[];
    rootExObjects?: ExObject[];
    properties?: PropertyKind["BasicProperty"][];
  };
}

export const Component = {
  creators: variant({
    CanvasComponent: fields<CanvasComponent>(),
    CustomComponent: fields<CustomComponent>(),
  }),

  creators2: {
    async CustomComponent(ctx: MainContext, creationArgs: ComponentCreationArgs["Custom"]) {
      const creationArgs2: Required<ComponentCreationArgs["Custom"]> = {
        id: creationArgs.id ?? Utils.createId("custom-component"),
        name: creationArgs.name ?? "Component",
        parameters: creationArgs.parameters ?? [],
        rootExObjects: creationArgs.rootExObjects ?? [],
        properties: creationArgs.properties ?? [],
      };

      const component = Component.creators.CustomComponent({
        id: "circle",
        parent$: of(null),
        name$: new BehaviorSubject(creationArgs2.name),
        parameters$: new BehaviorSubject(creationArgs2.parameters),
        rootExObjects$: new BehaviorSubject(creationArgs2.rootExObjects),
        properties$: new BehaviorSubject(creationArgs2.properties),

        async addParameterBlank() {
          const parameter = await createCustomComponentParameter(ctx, {});
          const parameters = await firstValueFrom(component.parameters$);
          this.parameters$.next([...parameters, parameter]);
          return parameter;
        },

        async addPropertyBlank() {
          const property = await Property.creators2.BasicProperty(ctx, {});
          const properties = await firstValueFrom(component.properties$);
          this.properties$.next([...properties, property]);
          return property;
        },
      });

      creationArgs2.rootExObjects.forEach((rootExObject) => {
        rootExObject.parent$.next(component);
      });

      return component;
    },
  },
};

export type Component = VariantOf<typeof Component.creators>;
export type ComponentKind = DexVariantKind<typeof Component.creators>;

export const CanvasComponentStore = {
  circle: Component.creators.CanvasComponent({
    id: "circle",
    parent$: of(null),
    parameters: [
      ComponentParameter.creators.Canvas({
        name: "x",
        id: "x",
        canvasSetter: (pixiObject, value) => {
          pixiObject.x = value;
        },
      }),
    ],
  }),
} satisfies Record<string, ComponentKind["CanvasComponent"]>;

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
    exObject.parent$.next(component);
    const rootExObjects = await firstValueFrom(component.rootExObjects$);
    component.rootExObjects$.next([...rootExObjects, exObject]);
  }
}
