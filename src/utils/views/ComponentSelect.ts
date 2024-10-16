import {
  Effect,
  Layer,
  Option,
  Ref,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";
import { CanvasComponentCtx } from "src/ctx/CanvasComponentCtx";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { Component } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import { ProjectCtx } from "src/ex-object/Project";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import { FocusCtx } from "src/focus/FocusCtx";
import type { DexSetup } from "../utils/EffectUtils";
import { ComboboxCtx } from "./Combobox";
import { ComboboxFieldCtx, type ComboboxFieldProp } from "./ComboboxField";

export interface ComponentOption {
  label: string;
  component: Component;
}

export interface ComponentSelectPropOut {}

export interface ComponentSelectState {
  comboboxFieldProp: ComboboxFieldProp<ComponentOption>;
}

export interface ComponentSelectProp {
  setup: DexSetup<ComponentSelectState>;
  out: ComponentSelectPropOut;
}

export class ComponentSelectCtx extends Effect.Tag(
  "ComponentSelectCtx"
)<ComponentSelectCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const comboboxFieldCtx = yield* ComboboxFieldCtx;
  const componentCtx = yield* ComponentCtx;
  const comboboxctx = yield* ComboboxCtx;
  const projectctx = yield* ProjectCtx;
  const canvasComponentCtx = yield* CanvasComponentCtx;
  const focusctx = yield* FocusCtx;

  const setup = (
    exObject: ExObject,
    svelteScope: Scope.Scope
  ): Effect.Effect<ComponentSelectState> =>
    Effect.gen(function* () {
      const project = (yield* projectctx.activeProject.get).pipe(
        Option.getOrThrow
      );

      const options = project.components.itemStream.pipe(
        Stream.mapEffect((components) =>
          Effect.all([
            ...components.map((component) =>
              Effect.gen(function* () {
                return {
                  label: Option.getOrThrow(
                    yield* Stream.runHead(component.name.pipe(Stream.take(1)))
                  ),
                  component,
                };
              })
            ),
            Effect.succeed({
              label: canvasComponentCtx.canvasComponents.circle.id,
              component: canvasComponentCtx.canvasComponents.circle,
            }),
          ])
        )
      );

      const query = yield* SubscriptionRef.make("");
      const filteredOptions = Stream.zipLatest(options, query.changes).pipe(
        Stream.map(([options_, query_]) =>
          options_.filter(
            (option) =>
              option.label.toLowerCase().includes(query_.toLowerCase()) ||
              query_ === ""
          )
        )
      );

      const comboboxProps = yield* comboboxctx.createProps<ComponentOption>({
        options: filteredOptions,
      });

      yield* Effect.forkIn(
        Stream.runForEach(comboboxProps.propsOut.onQueryChanged, (query_) => {
          return Effect.gen(function* () {
            yield* Ref.set(query, query_);
          });
        }),
        svelteScope
      );

      yield* Effect.forkIn(
        Stream.runForEach(comboboxProps.propsOut.onOptionSelected, (value) => {
          return Effect.gen(function* () {
            yield* exObject.setComponent(value.component);
            focusctx.popFocus();
          });
        }),
        svelteScope
      );

      const name = componentCtx.getName(yield* exObject.component.get);
      const focusTarget = new FocusTarget({
        item: exObject,
        kind: FocusKind2("ExObjectComponent"),
      });

      const comboboxFieldProp = comboboxFieldCtx.createProps(
        "Component",
        name,
        focusTarget,
        comboboxProps.propsIn
      );

      const state: ComponentSelectState = {
        comboboxFieldProp,
      };
      return state;
    });

  return {
    createProp: (
      exObject: ExObject
    ): Effect.Effect<ComponentSelectProp> => {
      return Effect.gen(function* () {
        const prop: ComponentSelectProp = {
          setup: setup.bind(undefined, exObject),
          out: {},
        };
        return prop;
      });
    },
  };
});

export const ComponentSelectCtxLive = Layer.effect(
  ComponentSelectCtx,
  ctxEffect
);
