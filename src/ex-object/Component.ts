// File: Component.ts

import { Effect, Stream } from "effect";
import { BehaviorSubject } from "rxjs";
import type { LibCanvasObject } from "src/canvas/Canvas";
import {
  type ComponentParameterKind
} from "src/ex-object/ComponentParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObjectFactory2, type ExObject } from "src/ex-object/ExObject";
import { type PropertyKind } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import { Utils, type SUB } from "src/utils/utils/Utils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

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
  name: Stream.Stream<string>;
  name$: SUB<string>;
  parameters: ObservableArray<ComponentParameterKind["Custom"]>;
  rootExObjects: ObservableArray<ExObject>;
  properties: ObservableArray<PropertyKind["BasicProperty"]>;
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

interface Component_ {
  Canvas: CanvasComponent_;
  Custom: CustomComponent_;
}

export const ComponentFactory = dexVariant.scoped("Component")(
  dexVariant.typed<Component_>({
    Canvas: pass,
    Custom: pass,
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

      const base = yield* ExItem.createExItemBase(creationArgs2.id);

      const name$ = new BehaviorSubject(creationArgs2.name);
      const component_: CustomComponent_ = {
        ...base,
        name$,
        name: EffectUtils.obsToStream(name$),
        parameters: createObservableArrayWithLifetime(
          base.destroy$,
          creationArgs2.parameters
        ),
        rootExObjects: createObservableArrayWithLifetime(
          base.destroy$,
          creationArgs2.rootExObjects
        ),
        properties: createObservableArrayWithLifetime(
          base.destroy$,
          creationArgs2.properties
        ),
      };

      const component2_: CustomComponent_ = {
        ...component_,
      };

      const component = ComponentFactory.Custom(component2_);

      creationArgs2.rootExObjects.forEach((rootExObject) => {
        rootExObject.parent$.next(component);
      });

      for (const property of creationArgs2.properties) {
        property.parent$.next(component);
      }

      return component;
    }),
};

export const Component = {
  addRootExObjectBlank(component: ComponentKind["Custom"]) {
    return Effect.gen(function* () {
      const exObject = yield* ExObjectFactory2({});
      exObject.parent$.next(component);
      yield* component.rootExObjects.push(exObject);
    });
  },
};
