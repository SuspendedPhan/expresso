import { Effect } from "effect";
import { BehaviorSubject, firstValueFrom, of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import {
  ComponentParameterFactory,
  ComponentParameterFactory2,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import { ExObjectFactory2, type ExObject } from "src/ex-object/ExObject";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import { Utils, type OBS, type SUB } from "src/utils/utils/Utils";
import { type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, matcher, scoped, variant, type VariantOf } from "variant";

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
  parameters$: SUB<ComponentParameterKind["Custom"][]>;
  rootExObjects$: SUB<ExObject[]>;
  properties$: SUB<PropertyKind["BasicProperty"][]>;

  addParameterBlank(): Effect.Effect<ComponentParameterKind["Custom"]>;
  addPropertyBlank(): Effect.Effect<PropertyKind["BasicProperty"]>;
}

export interface ComponentCreationArgs {
  Custom: {
    id?: string;
    name?: string;
    parameters?: ComponentParameterKind["Custom"][];
    rootExObjects?: ExObject[];
    properties?: PropertyKind["BasicProperty"][];
  };
}

export const ComponentFactory = variant(
  scoped("Component", {
    Canvas: fields<CanvasComponent>(),
    Custom: fields<CustomComponent>(),
  })
);

export type Component = VariantOf<typeof ComponentFactory>;
export type ComponentKind = DexVariantKind<typeof ComponentFactory>;

export const ComponentFactory2 = {
  Custom: (creationArgs: ComponentCreationArgs["Custom"]) =>
    Effect.gen(function* () {
      const creationArgs2: Required<ComponentCreationArgs["Custom"]> = {
        id: creationArgs.id ?? Utils.createId("custom-component"),
        name: creationArgs.name ?? "Component",
        parameters: creationArgs.parameters ?? [],
        rootExObjects: creationArgs.rootExObjects ?? [],
        properties: creationArgs.properties ?? [],
      };

      const component = ComponentFactory.Custom({
        id: "circle",
        parent$: of(null),
        name$: new BehaviorSubject(creationArgs2.name),
        parameters$: new BehaviorSubject(creationArgs2.parameters),
        rootExObjects$: new BehaviorSubject(creationArgs2.rootExObjects),
        properties$: new BehaviorSubject(creationArgs2.properties),

        addParameterBlank() {
          const component = this;
          return Effect.gen(function* () {
            const parameter = ComponentParameterFactory2.Custom({});
            const parameters = yield* Effect.promise(() => firstValueFrom(component.parameters$));
            component.parameters$.next([...parameters, parameter]);
            return parameter;
          });
        },

        addPropertyBlank() {
          const component = this;
          return Effect.gen(function* () {
            const property = yield* Effect.promise(() => PropertyFactory2.BasicProperty(ctx, {}));
            const properties = yield* Effect.promise(() => firstValueFrom(component.properties$));
            component.properties$.next([...properties, property]);
            return property;
          });
        },
      });

      creationArgs2.rootExObjects.forEach((rootExObject) => {
        rootExObject.parent$.next(component);
      });

      return component;
    }),
};

// const ComponentMethods = {
//   addParameterBlank: Effect.gen(function* () {
//     const parameter = ComponentParameterFactory2.Custom(ctx, {});
//     const parameters = yield* Effect.promise(firstValueFrom(component.parameters$));
//     this.parameters$.next([...parameters, parameter]);
//     return parameter;
//   }),

//   async addPropertyBlank() {
//     const property = await PropertyFactory2.BasicProperty(ctx, {});
//     const properties = await firstValueFrom(component.properties$);
//     this.properties$.next([...properties, property]);
//     return property;
//   },
// }

export const CanvasComponentStore = {
  circle: ComponentFactory.Canvas({
    id: "circle",
    parent$: of(null),
    parameters: [
      ComponentParameterFactory.Canvas({
        name: "x",
        id: "x",
        canvasSetter: (pixiObject, value) => {
          pixiObject.x = value;
        },
      }),
    ],
  }),
} satisfies Record<string, ComponentKind["Canvas"]>;

export function createComponentCtx(_ctx: MainContext) {
  const parameterById = new Map<string, ComponentParameterKind["Canvas"]>();
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

export const Component = {
  getName$(component: Component): OBS<string> {
    return matcher(component)
      .when(ComponentFactory.Canvas, (component) => {
        return of(component.id);
      })
      .when(ComponentFactory.Custom, (component) => {
        return component.name$;
      })
      .complete();
  },

  async addRootExObjectBlank(
    _ctx: MainContext,
    component: ComponentKind["Custom"]
  ): Promise<void> {
    const exObject = await ExObjectFactory2(_ctx, {});
    exObject.parent$.next(component);
    const rootExObjects = await firstValueFrom(component.rootExObjects$);
    component.rootExObjects$.next([...rootExObjects, exObject]);
  },
};
