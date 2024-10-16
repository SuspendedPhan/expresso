import { Effect, Layer } from "effect";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property, PropertyKind } from "src/ex-object/Property";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import { writable, type Readable } from "svelte/store";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import {
  ComponentSelectCtx,
  type ComponentSelectProp,
} from "./ComponentSelect";
import { FocusViewCtx } from "./FocusView";
import { TextFieldCtx, type TextFieldProp } from "./TextField";

export interface ExObjectViewPropOut {}

export interface ExObjectViewState {
  exObject: ExObject;

  nameFieldProp: TextFieldProp;
  componentFieldProp: ComponentSelectProp;

  componentParameterProperties: Readable<Property[]>;
  cloneCountProperty: Readable<Property>;
  basicProperties: Readable<PropertyKind["BasicProperty"][]>;
  children: Readable<ExObject[]>;
}

export interface ExObjectViewProp {
  setup: DexSetup<ExObjectViewState>;
  out: ExObjectViewPropOut;
}

export class ExObjectViewCtx extends Effect.Tag("ExObjectViewCtx")<
  ExObjectViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const textFieldCtx = yield* TextFieldCtx;
  const focusViewCtx = yield* FocusViewCtx;
  const componentSelectCtx = yield* ComponentSelectCtx;

  return {
    createProp: (exObject: ExObject): Effect.Effect<ExObjectViewProp> => {
      return Effect.gen(function* () {
        const prop: ExObjectViewProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const state: ExObjectViewState = {
                exObject,
                nameFieldProp: yield* textFieldCtx.createProps(
                  "Name",
                  exObject.name,
                  yield* focusViewCtx.createProps(
                    new FocusTarget({
                      kind: FocusKind2("ExObjectName"),
                      item: exObject,
                    }),
                    true
                  )
                ),

                componentFieldProp: yield* componentSelectCtx.createProp(
                  exObject
                ),

                componentParameterProperties:
                  yield* EffectUtils.makeScopedReadableFromStream(
                    exObject.componentParameterProperties_.itemStream,
                    svelteScope
                  ),

                cloneCountProperty: writable(exObject.cloneCountProperty),
                basicProperties:
                  yield* EffectUtils.makeScopedReadableFromStream(
                    exObject.basicProperties.itemStream,
                    svelteScope
                  ),

                children: yield* EffectUtils.makeScopedReadableFromStream(
                  exObject.children.itemStream,
                  svelteScope
                ),
              };
              return state;
            }),
          out: {},
        };
        return prop;
      });
    },
  };
});

export const ExObjectViewCtxLive = Layer.effect(ExObjectViewCtx, ctxEffect);
