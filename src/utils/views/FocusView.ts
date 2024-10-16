import assert from "assert-ts";
import { Chunk, Deferred, Effect, Equal, Layer, Scope, Stream } from "effect";
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
  isEditing: Deferred.Deferred<Stream.Stream<boolean>>;
};

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
        const propOut: FocusViewPropOut = {
          isEditing: yield* Deferred.make<Stream.Stream<boolean>>(),
        };

        const focused = writable(false);

        const vv: FocusViewPropIn = (svelteScope) => {
          return Effect.gen(function* () {
            const isEditing_ = focus2Ctx.focusByTarget(target).pipe(
              Stream.unwrap,
              Stream.flatMap((focus) => focus.isEditing.changes, {
                switch: true,
              })
            );
            yield* propOut.isEditing.pipe(Deferred.succeed(isEditing_));

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
