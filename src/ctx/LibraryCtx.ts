import { Context, Effect, Layer } from "effect";
import {
  BehaviorSubject,
  firstValueFrom,
  ReplaySubject,
  switchMap
} from "rxjs";
import type { LibraryProject } from "src/library/LibraryProject";


export class LibraryCtx extends Context.Tag("LibraryCtx")<
  LibraryCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    const activeLibraryProject$ = new ReplaySubject<LibraryProject>(1);
    return {
      libraryProjects$: new BehaviorSubject<readonly LibraryProject[]>([]),
      activeLibraryProject$,
    };
});

export const LibraryCtxLive = Layer.effect(
  LibraryCtx,
  ctxEffect
);

