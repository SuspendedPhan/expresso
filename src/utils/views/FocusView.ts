import assert from "assert-ts";
import {
  Effect,
  Equal,
  Layer,
  Ref,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";
import { Focus2, Focus2Ctx, type FocusTarget } from "src/focus/Focus2";
import { writable, type Readable, type Writable } from "svelte/store";
import { DexRuntime } from "../utils/DexRuntime";
import { EffectUtils } from "../utils/EffectUtils";

export interface FocusViewState {
  focused: Readable<boolean>;
  onMouseDown: () => void;
}

export type FocusViewPropIn = (
  svelteScope: Scope.Scope
) => Effect.Effect<FocusViewState>;

export type FocusViewPropOut = {
  isEditing: Stream.Stream<boolean>;
};

export type FocusViewProp = [FocusViewPropIn, FocusViewPropOut];

export class FocusViewCtx extends Effect.Tag("FocusViewCtx")<
  FocusViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focus2Ctx = yield* Focus2Ctx;

  const onFocus = (
    focus: Focus2,
    target: FocusTarget,
    focused: Writable<boolean>,
    isEditing: SubscriptionRef.SubscriptionRef<boolean>,
    editable: boolean
  ) =>
    Effect.gen(function* () {
      assert(Equal.equals(focus.target, target));
      focused.set(true);

      if (editable) {
        yield* attachEditKey(focus);
      }

      yield* focus.isEditing.changes.pipe(
        Stream.runForEach((editing) => Ref.set(isEditing, editing)),
        Effect.forkIn(focus.scope)
      );

      yield* Scope.addFinalizer(
        focus.scope,
        Effect.gen(function* () {
          focused.set(false);
        })
      );
    });

  const attachEditKey = (focus: Focus2) =>
    EffectUtils.onKeyDown("e").pipe(
      Stream.runForEach(() =>
        Effect.gen(function* () {
          yield* Ref.set(focus.isEditing, true);
        })
      ),
      Effect.forkIn(focus.scope)
    );

  return {
    createProps(
      target: FocusTarget,
      editable: boolean
    ): Effect.Effect<[FocusViewPropIn, FocusViewPropOut]> {
      return Effect.gen(function* () {
        const isEditing = yield* SubscriptionRef.make(false);

        const propOut: FocusViewPropOut = {
          isEditing: isEditing.changes,
        };

        const focused = writable(false);

        const vv: FocusViewPropIn = (svelteScope) => {
          return Effect.gen(function* () {
            const vv = focus2Ctx.focusByTarget(target).pipe(
              Stream.runForEach((focus) =>
                Effect.gen(function* () {
                  yield* onFocus(focus, target, focused, isEditing, editable);
                })
              ),
              Effect.forkIn(svelteScope)
            );
            yield* vv;
            const propIn = {
              focused,
              onMouseDown: () => {
                DexRuntime.runPromise(
                  Effect.gen(function* () {
                    yield* focus2Ctx.setFocus(target);
                  })
                );
              },
            };
            return propIn;
          });
        };

        return [vv, propOut];
      });
    },
  };
});

export const FocusViewCtxLive = Layer.effect(FocusViewCtx, ctxEffect);
