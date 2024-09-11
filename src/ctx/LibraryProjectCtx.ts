import { Effect, Layer } from "effect";
import { ReplaySubject } from "rxjs";
import {
  LibraryProjectFactory2,
  type LibraryProject,
} from "src/ex-object/LibraryProject";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export class LibraryProjectCtx extends Effect.Tag("LibraryProjectCtx")<
  LibraryProjectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const activeLibraryProject$ = new ReplaySubject<LibraryProject>(1);
  activeLibraryProject$.next(yield* LibraryProjectFactory2({}));

  return {
    activeLibraryProject$,
    get activeLibraryProject() {
      return EffectUtils.firstValueFrom(this.activeLibraryProject$);
    },
  };
});

export const LibraryProjectCtxLive = Layer.effect(LibraryProjectCtx, ctxEffect);
