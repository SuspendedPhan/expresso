import { Effect, Layer } from "effect";
import { ReplaySubject } from "rxjs";
import {
  type LibraryProject
} from "src/ex-object/LibraryProject";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("LibraryProjectCtx.ts");

export class LibraryProjectCtx extends Effect.Tag("LibraryProjectCtx")<
  LibraryProjectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const activeLibraryProject$ = new ReplaySubject<LibraryProject>(1);
  log55.debug("activeLibraryProject$");

  return {
    get activeLibraryProject$() {
      return activeLibraryProject$;
    },
    get activeLibraryProject() {
      return EffectUtils.firstValueFrom(this.activeLibraryProject$);
    },
  };
});

export const LibraryProjectCtxLive = Layer.effect(LibraryProjectCtx, ctxEffect);
