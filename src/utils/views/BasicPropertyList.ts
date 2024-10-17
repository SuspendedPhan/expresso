import { Effect, Layer, Stream } from "effect";
import type { Readable } from "svelte/motion";
import type { DexSetupItem } from "../utils/DexUtils";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import { PropertyViewCtx, type PropertyViewState } from "./PropertyView";
import type { PropertyKind } from "src/ex-object/Property";
import { writable } from "svelte/store";

export interface BasicPropertyListPropOut {
  onAddProperty: Stream.Stream<void>;
}

export interface BasicPropertyListState {
  properties: Readable<Array<DexSetupItem<PropertyViewState>>>;
  onClickAddProperty: () => void;
}

export interface BasicPropertyListProp {
  setup: DexSetup<BasicPropertyListState>;
  out: BasicPropertyListPropOut;
}

export class BasicPropertyListCtx extends Effect.Tag("BasicPropertyListCtx")<
  BasicPropertyListCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const propertyviewctx = yield* PropertyViewCtx;

  return {
    createProp: (
      properties: PropertyKind["BasicProperty"][]
    ): Effect.Effect<BasicPropertyListProp> => {
      return Effect.gen(function* () {
        const onClickAddProperty = EffectUtils.makeCallbackStream<void>();

        const setups = new Array<DexSetupItem<PropertyViewState>>();
        for (const property of properties) {
          const prop = yield* propertyviewctx.createProp(property);
          setups.push({
            id: property.id,
            setup: prop.setup,
          });
        }

        const prop: BasicPropertyListProp = {
          setup: (_svelteScope) =>
            Effect.gen(function* () {
              const state: BasicPropertyListState = {
                onClickAddProperty: onClickAddProperty.callback,
                properties: writable(setups),
              };
              return state;
            }),
          out: {
            onAddProperty: onClickAddProperty.stream,
          },
        };
        return prop;
      });
    },
  };
});

export const BasicPropertyListCtxLive = Layer.effect(
  BasicPropertyListCtx,
  ctxEffect
);
