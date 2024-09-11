import { Effect, Layer } from "effect";
import { ReplaySubject } from "rxjs";
import { LibraryFactory2, type Library } from "src/ex-object/Library";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export class LibraryCtx extends Effect.Tag("LibraryCtx")<
  LibraryCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const library$ = new ReplaySubject<Library>(1);
  library$.next(yield* LibraryFactory2({}));
  return {
    library$,
    get library() {
      return Effect.gen(this, function* () {
        return yield* EffectUtils.firstValueFrom(this.library$);
      });
    },
  };
});

export const LibraryCtxLive = Layer.effect(LibraryCtx, ctxEffect);
