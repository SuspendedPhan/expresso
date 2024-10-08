import { Effect, Layer, Option, Ref, Stream, SubscriptionRef } from "effect";
import { CanvasComponentCtx } from "src/ctx/CanvasComponentCtx";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { Component } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import { Project } from "src/ex-object/Project";
import { ExObjectFocusFactory } from "src/focus/ExObjectFocus";
import { FocusCtx } from "src/focus/FocusCtx";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { ComboboxCtx } from "src/utils/views/Combobox";
import type { ComboboxFieldPropsIn } from "src/utils/views/ComboboxField";
import { createFieldValueData } from "src/utils/views/Field";
import { isType } from "variant";

export interface ComponentOption {
  label: string;
  component: Component;
}

export class ComponentSelectCtx extends Effect.Tag("ComponentSelectCtx")<
  ComponentSelectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createComboboxFieldPropsIn(exObject: ExObject) {
      return Effect.gen(function* () {
        const comboboxCtx = yield* ComboboxCtx;
        const componentCtx = yield* ComponentCtx;
        const focusCtx = yield* FocusCtx;
        const canvasComponentCtx = yield* CanvasComponentCtx;

        const project = yield* Project.activeProject;

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

        const props = yield* comboboxCtx.createProps<ComponentOption>({
          options: filteredOptions,
        });

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onOptionSelected, (value) => {
            return Effect.gen(function* () {
              console.log(`Selected: ${value.label}`);
            });
          })
        );

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onQueryChanged, (query_) => {
            return Effect.gen(function* () {
              yield* Ref.set(query, query_);
            });
          })
        );

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onOptionSelected, (value) => {
            return Effect.gen(function* () {
              yield* exObject.setComponent(value.component);
              focusCtx.popFocus();
            });
          })
        );

        const result: ComboboxFieldPropsIn<ComponentOption> = {
          propsIn: props.propsIn,
          label: "Component",
          fieldValueData: yield* createFieldValueData({
            createEditingFocusFn: (isEditing) =>
              ExObjectFocusFactory.Component({ exObject, isEditing }),
            focusIsFn: (focus) => isType(focus, ExObjectFocusFactory.Component),
            filterFn: (focus) => focus.exObject === exObject,
          }),
          displayValue: yield* EffectUtils.streamToReadable(
            exObject.component.changes.pipe(
              EffectUtils.switchMap((component) =>
                componentCtx.getName(component)
              )
            )
          ),
        };
        return result;
      });
    },
  };
});

export const ComponentSelectCtxLive = Layer.effect(
  ComponentSelectCtx,
  ctxEffect
);
