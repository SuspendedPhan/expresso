import { Context, Effect, Layer } from "effect";
import { ReplaySubject } from "rxjs";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export class LibraryProjectCtx extends Context.Tag("LibraryProjectCtx")<
  LibraryProjectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    activeLibraryProject$: new ReplaySubject<LibraryProject>(1),
    get activeLibraryProject() {
      return EffectUtils.firstValueFrom(this.activeLibraryProject$);
    },
  };
});

export const LibraryProjectCtxLive = Layer.effect(LibraryProjectCtx, ctxEffect);
