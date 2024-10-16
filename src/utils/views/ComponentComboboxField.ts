import type { Component } from "src/ex-object/Component";
import type { DexSetup } from "../utils/EffectUtils";
import { Effect, Layer } from "effect";
import type { ExObject } from "src/ex-object/ExObject";
import { ComboboxFieldCtx, type ComboboxFieldProp } from "./ComboboxField";
import ComboboxField from "./ComboboxField.svelte";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import { ComboboxCtx } from "./Combobox";

export interface ComponentOption {
  label: string;
  component: Component;
}

interface ComponentComboboxFieldPropOut {}

interface ComponentComboboxFieldState {
  comboboxFieldProp: ComboboxFieldProp<ComponentOption>;
}

interface ComponentComboboxFieldProp {
  setup: DexSetup<ComponentComboboxFieldState>;
  out: ComponentComboboxFieldPropOut;
}

export class ComponentComboboxFieldCtx extends Effect.Tag(
  "ComponentComboboxFieldCtx"
)<ComponentComboboxFieldCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const comboboxFieldCtx = yield* ComboboxFieldCtx;
  const componentCtx = yield* ComponentCtx;
  const comboboxctx = yield* ComboboxCtx;

  return {
    createProp: (
      exObject: ExObject
    ): Effect.Effect<ComponentComboboxFieldProp> => {
      return Effect.gen(function* () {
        const prop: ComponentComboboxFieldProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const name = componentCtx.getName(yield* exObject.component.get);
              const focusTarget = new FocusTarget({
                item: exObject,
                kind: FocusKind2("ExObjectComponent"),
              });

            //   comboboxctx.createProps({
            //     options: 
            //   })
              comboboxFieldCtx.createProps("Component", name, focusTarget);
              const state: ComponentComboboxFieldState = {};
              return state;
            }),
          out: {},
        };
        return prop;
      });
    },
  };
});

export const ComponentComboboxFieldCtxLive = Layer.effect(
  ComponentComboboxFieldCtx,
  ctxEffect
);
