import { Context, Effect, Layer } from "effect";
import { ReplaySubject } from "rxjs";
import { type Library } from "src/library/Library";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export class LibraryCtx extends Context.Tag("LibraryCtx")<
  LibraryCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    library$: new ReplaySubject<Library>(1),
    get library() {
      return Effect.gen(this, function* () {
        return yield* EffectUtils.firstValueFrom(this.library$);
      });
    },
  };
});

export const LibraryCtxLive = Layer.effect(LibraryCtx, ctxEffect);
