import { Effect, Layer, Option, Scope, Stream } from "effect";
import type { Readable } from "svelte/motion";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import { RootExprViewCtx, type RootExprViewState } from "./RootExprView";
import { TextFieldCtx, type DexSetup<TextFieldState> } from "./TextField";
import { FocusViewCtx } from "./FocusView";
import { Property } from "src/ex-object/Property";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import assert from "assert-ts";

export interface PropertyViewPropOut {}

export interface PropertyViewState {
  nameFieldPropIn: DexSetup<TextFieldState>;
  rootExprViewSetup: Readable<DexSetup<RootExprViewState>>;
  isNumberExpr: Readable<boolean>;
}

export interface PropertyViewProp {
  setup: DexSetup<PropertyViewState>;
  out: PropertyViewPropOut;
}

export class PropertyViewCtx extends Effect.Tag("PropertyViewCtx")<
  PropertyViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const textfieldctx = yield* TextFieldCtx;
  const focusviewctx = yield* FocusViewCtx;
  const rootexprviewctx = yield* RootExprViewCtx;

  return {
    createProp: (property: Property): Effect.Effect<PropertyViewProp> => {
      return Effect.gen(function* () {
        const prop: PropertyViewProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const editable = property.type === "Property/BasicProperty";
              const focusProps = yield* focusviewctx.createProps(
                new FocusTarget({
                  item: property,
                  kind: FocusKind2("PropertyName"),
                }),
                editable
              );

              const name = Property.Methods(property).getName$();
              const name2 = EffectUtils.makeStreamFromObs(name);
              const [nameFieldPropIn, nameFieldPropOut] = yield* textfieldctx.createProps(
                Option.none(),
                name2,
                focusProps
              );
              
              yield* nameFieldPropOut.value.pipe(
                Stream.runForEach((value) => {
                    return Effect.gen(function* () {
                        assert(property.type === "Property/BasicProperty");
                        property.name$.next(value);
                    });
                }),
                Effect.forkIn(svelteScope),
                Scope.extend(svelteScope)
              );

              const isNumberExpr = property.expr.changes.pipe(
                Stream.map((expr) => expr.type === "Expr/Number")
              );

              const rootExprViewSetup = property.expr.changes.pipe(
                Stream.mapEffect((expr) => {
                  return Effect.gen(function* () {
                    const prop = yield* rootexprviewctx.createProp(expr);
                    return prop.setup;
                  })
                })
              )

              const state: PropertyViewState = {
                nameFieldPropIn,
                isNumberExpr: yield* EffectUtils.makeScopedReadableFromStream(isNumberExpr, svelteScope),
                rootExprViewSetup: yield* EffectUtils.makeScopedReadableFromStream(rootExprViewSetup, svelteScope),
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

export const PropertyViewCtxLive = Layer.effect(PropertyViewCtx, ctxEffect);
