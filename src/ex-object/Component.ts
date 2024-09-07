import { Effect } from "effect";
import { BehaviorSubject, firstValueFrom, of } from "rxjs";
import type { LibCanvasObject } from "src/canvas/CanvasContext";
import {
  ComponentParameterFactory,
  ComponentParameterFactory2,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObjectFactory2, type ExObject } from "src/ex-object/ExObject";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { Utils, type OBS, type SUB } from "src/utils/utils/Utils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { matcher, pass, type VariantOf } from "variant";

// const log55 = log5("Component.ts");

export type CanvasSetter = (
  canvasObject: LibCanvasObject,
  value: number
) => void;

interface CanvasComponent_ {
  id: string;
  parameters: ComponentParameterKind["Canvas"][];
}

interface CustomComponent_ extends ExItemBase {
  name$: SUB<string>;
  parameters$: SUB<ComponentParameterKind["Custom"][]>;
  rootExObjects$: SUB<ExObject[]>;
  properties$: SUB<PropertyKind["BasicProperty"][]>;
}

type CustomComponent2_ = CustomComponent_ & ReturnType<typeof customComponentMethodsFactory>;

export interface ComponentCreationArgs {
  Custom: {
    id?: string;
    name?: string;
    parameters?: ComponentParameterKind["Custom"][];
    rootExObjects?: ExObject[];
    properties?: PropertyKind["BasicProperty"][];
  };
}

interface Component_ {
  Canvas: CanvasComponent_;
  Custom: CustomComponent2_;
}

export const ComponentFactory = dexVariant.scoped("Component")(dexVariant.typed<Component_>({
  Canvas: pass,
  Custom: pass,
}));

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

      const base = yield* ExItem.createExItemBase(creationArgs2.id);

      const component_: CustomComponent_ = {
        ...base,
        name$: new BehaviorSubject(creationArgs2.name),
        parameters$: new BehaviorSubject(creationArgs2.parameters),
        rootExObjects$: new BehaviorSubject(creationArgs2.rootExObjects),
        properties$: new BehaviorSubject(creationArgs2.properties),
      };

      const component2_: CustomComponent2_ = {
        ...component_,
        ...customComponentMethodsFactory(component_),
      };

      const component = ComponentFactory.Custom(component2_);

      creationArgs2.rootExObjects.forEach((rootExObject) => {
        rootExObject.parent$.next(component);
      });

      return component;
    }),
};

function customComponentMethodsFactory(component: CustomComponent_) {
  return {
    addParameterBlank() {
      return Effect.gen(function* () {
        const parameter = ComponentParameterFactory2.Custom({});
        const parameters = yield* Effect.promise(() =>
          firstValueFrom(component.parameters$)
        );
        component.parameters$.next([...parameters, parameter]);
        return parameter;
      });
    },

    addPropertyBlank() {
      return Effect.gen(function* () {
        const property = yield* PropertyFactory2.BasicProperty({});
        const properties = yield* EffectUtils.firstValueFrom(
          component.properties$
        );
        component.properties$.next([...properties, property]);
        return property;
      });
    },
  };
}

export const CanvasComponentStore = {
  circle: ComponentFactory.Canvas({
    id: "circle",
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
