// File: ComponentParameter.ts

import { Effect } from "effect";
import { BehaviorSubject, of } from "rxjs";
import type { CanvasSetter } from "src/ex-object/Component";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { type OBS, type SUB, Utils } from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, matcher, type VariantOf } from "variant";

interface CanvasComponentParameter {
  readonly id: string;
  readonly name: string;
  readonly canvasSetter: CanvasSetter;
}

interface CustomComponentParameter extends ExItemBase {
  readonly id: string;
  readonly name$: SUB<string>;
}

export interface ComponentParameterCreationArgs {
  CustomComponentParameter: {
    id?: string;
    name?: string;
  };
}

export const ComponentParameterFactory = dexScopedVariant(
  "ComponentParameter",
  {
    Canvas: fields<CanvasComponentParameter>(),
    Custom: fields<CustomComponentParameter>(),
  }
);

export type ComponentParameter = VariantOf<typeof ComponentParameterFactory>;
export type ComponentParameterKind = DexVariantKind<
  typeof ComponentParameterFactory
>;

export const ComponentParameterFactory2 = {
  Custom(
    creationArgs: ComponentParameterCreationArgs["CustomComponentParameter"]
  ) {
    return Effect.gen(function* () {
      const creationArgs2: Required<
        ComponentParameterCreationArgs["CustomComponentParameter"]
      > = {
        id: creationArgs.id ?? Utils.createId("custom-component-parameter"),
        name: creationArgs.name ?? "Parameter",
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const parameter = ComponentParameterFactory.Custom({
        ...base,
        id: creationArgs2.id,
        name$: new BehaviorSubject(creationArgs2.name),
      });
      return parameter;
    });
  },
};

export const ComponentParameter = {
  getName$(componentParameter: ComponentParameter): OBS<string> {
    return matcher(componentParameter)
      .when(ComponentParameterFactory.Canvas, (componentParameter) => {
        return of(componentParameter.name);
      })
      .when(ComponentParameterFactory.Custom, (componentParameter) => {
        return componentParameter.name$;
      })
      .complete();
  },
};
