import { BehaviorSubject } from "rxjs";
import type { CanvasSetter } from "src/ex-object/Component";
import type MainContext from "src/main-context/MainContext";
import { type SUB, Utils } from "src/utils/utils/Utils";
import { dexScopedVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, type VariantOf } from "variant";

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
    async Custom(
      _ctx: MainContext,
      creationArgs: ComponentParameterCreationArgs["CustomComponentParameter"]
    ) {
      const creationArgs2: Required<
        ComponentParameterCreationArgs["CustomComponentParameter"]
      > = {
        id: creationArgs.id ?? Utils.createId("custom-component-parameter"),
        name: creationArgs.name ?? "Parameter",
      };
      const parameter = ComponentParameterFactory.Custom({
        id: creationArgs2.id,
        name$: new BehaviorSubject(creationArgs2.name),
      });
      return parameter;
    },
  };