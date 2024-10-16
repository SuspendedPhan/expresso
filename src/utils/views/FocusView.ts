import assert from "assert-ts";
import { Chunk, Effect, Equal, Layer, Ref, Scope, Stream, SubscriptionRef } from "effect";
import { Focus2Ctx, type FocusTarget } from "src/focus/Focus2";
import { writable, type Readable } from "svelte/store";

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

  return {
    createProps(
      target: FocusTarget,
      editable: boolean
    ): Effect.Effect<[FocusViewPropIn, FocusViewPropOut]> {
      return Effect.gen(function* () {
        const isEditing = yield* SubscriptionRef.make(false);
        
        const propOut: FocusViewPropOut = {
          isEditing: isEditing.changes
        };

        const focused = writable(false);

        const vv: FocusViewPropIn = (svelteScope) => {
          return Effect.gen(function* () {
            focus2Ctx.focusByTarget(target).pipe(
              Stream.unwrap,
              Stream.flatMap((focus) => focus.isEditing.changes, {
                switch: true,
              }),
              Stream.runForEachScoped((editing) => Ref.set(isEditing, editing)),
              Scope.extend(svelteScope)
            );

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

                  if (editable) {
                    Stream.asyncScoped((emit) =>
                      Effect.acquireRelease(
                        Effect.gen(function* () {
                          const vv = () =>
                            emit(Effect.succeed(Chunk.of(undefined)));

                          document.addEventListener("mousedown", vv);
                          return vv;
                        }),
                        (vv) =>
                          Effect.gen(function* () {
                            document.removeEventListener("mousedown", vv);
                          })
                      )
                    ).pipe(
                      Stream.runForEach(() =>
                        Effect.gen(function* () {
                          focus2Ctx.setFocus(target);
                        })
                      ),
                      Effect.forkIn(focus.scope)
                    );
                  }
                })
              ),
              Effect.forkIn(svelteScope)
            );
            yield* vv;
            const propIn = {
              focused,
              onMouseDown: () => {
                focus2Ctx.setFocus(target);
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
