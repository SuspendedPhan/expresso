import assert from "assert-ts";
import { Effect, Equal, Layer, Scope, Stream } from "effect";
import { Focus2Ctx, type FocusTarget } from "src/focus/Focus2";
import { writable, type Readable } from "svelte/store";

export interface FocusViewState {
  focused: Readable<boolean>;
  onMouseDown: () => void;
}

export type FocusViewPropIn = (
  svelteScope: Scope.Scope
) => Effect.Effect<FocusViewState>;

export class FocusViewCtx extends Effect.Tag("FocusViewCtx")<
  FocusViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focus2Ctx = yield* Focus2Ctx;

  return {
    createProps(target: FocusTarget): FocusViewPropIn {
      const focused = writable(false);

      const vv: FocusViewPropIn = (svelteScope) => {
        return Effect.gen(function* () {
          const vv = focus2Ctx.focusByTarget(target).pipe(
            Stream.unwrap,
            Stream.runForEach((focus) =>
              Effect.gen(function* () {
                assert(Equal.equals(focus.target, target));
                focused.set(focus.target === target);
                yield* Scope.addFinalizer(
                  focus.scope,
                  Effect.gen(function* () {
                    focused.set(false);
                  })
                );
              })
            ),
            Effect.forkIn(svelteScope)
          );
          yield* vv;
          return {
            focused,
            onMouseDown: () => {
              focus2Ctx.setFocus(target);
            },
          };
        });
      };

      return vv;
    },
  };
});

export const FocusViewCtxLive = Layer.effect(FocusViewCtx, ctxEffect);
