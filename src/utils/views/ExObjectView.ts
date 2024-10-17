import { Effect, Layer, Option, Stream } from "effect";
import { ExObject } from "src/ex-object/ExObject";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import { writable, type Readable } from "svelte/store";
import type { DexSetupItem } from "../utils/DexUtils";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import {
  BasicPropertyListCtx,
  type BasicPropertyListState,
} from "./BasicPropertyList";
import {
  ComponentSelectCtx,
  type ComponentSelectProp,
} from "./ComponentSelect";
import { FocusViewCtx } from "./FocusView";
import { PropertyViewCtx, type PropertyViewState } from "./PropertyView";
import { TextFieldCtx, type TextFieldProp } from "./TextField";

export interface ExObjectViewPropOut {}

export interface ExObjectViewState {
  exObject: ExObject;

  nameFieldProp: TextFieldProp;
  componentFieldProp: ComponentSelectProp;

  componentParameterProperties: Readable<
    Array<DexSetupItem<PropertyViewState>>
  >;
  cloneCountProperty: Readable<DexSetup<PropertyViewState>>;
  basicProperties: Readable<DexSetup<BasicPropertyListState>>;
  children: Readable<Array<DexSetupItem<ExObjectViewState>>>;
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
  const propertyviewctx = yield* PropertyViewCtx;
  const basicpropertylistctx = yield* BasicPropertyListCtx;

  return {
    createProp(exObject: ExObject): Effect.Effect<ExObjectViewProp> {
      const exObjectViewCreateProp = (exObject: ExObject) => this.createProp(exObject);

      return Effect.gen(function* () {
        const prop: ExObjectViewProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const componentParameterProperties =
                exObject.componentParameterProperties_.itemStream.pipe(
                  Stream.map((pp) =>
                    pp.map((p): DexSetupItem<PropertyViewState> => {
                      return {
                        id: p.id,
                        setup: (svelteScope) =>
                          propertyviewctx
                            .createProp(p)
                            .pipe(
                              Effect.flatMap((prop) => prop.setup(svelteScope))
                            ),
                      };
                    })
                  )
                );

              const cloneCountProperty = (yield* propertyviewctx.createProp(
                exObject.cloneCountProperty
              )).setup;

              const basicProperties = exObject.basicProperties.itemStream.pipe(
                Stream.mapEffect((basicProperties) => {
                  return Effect.gen(function* () {
                    const prop = yield* basicpropertylistctx.createProp(
                      basicProperties
                    );
                    yield* prop.out.onAddProperty.pipe(
                      Stream.runForEach(() => {
                        return Effect.gen(function* () {
                          yield* ExObject.Methods(
                            exObject
                          ).addBasicPropertyBlank();
                        });
                      }),
                      Effect.forkIn(svelteScope)
                    );
                    return prop.setup;
                  });
                })
              );

              const children = exObject.children.itemStream.pipe(
                Stream.map((children) =>
                  children.map((child): DexSetupItem<ExObjectViewState> => {
                    return {
                      id: child.id,
                      setup: (svelteScope) =>
                        Effect.gen(function* () {
                          const prop = yield* exObjectViewCreateProp(child);
                          return yield* prop.setup(svelteScope);
                        }),
                    };
                  })
                )
              );

              const state: ExObjectViewState = {
                exObject,
                nameFieldProp: yield* textFieldCtx.createProps(
                  Option.some("Name"),
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
                    componentParameterProperties,
                    svelteScope
                  ),

                cloneCountProperty: writable(cloneCountProperty),
                basicProperties:
                  yield* EffectUtils.makeScopedReadableFromStream(
                    basicProperties,
                    svelteScope
                  ),

                children: yield* EffectUtils.makeScopedReadableFromStream(
                  children,
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
