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
      activeProject$: activeLibraryProject$.pipe(
        switchMap((libraryProject) => libraryProject.project$)
      ),

      get activeProject() {
        return Effect.gen(function* () {
          const project = yield* Effect.promise(() =>
            firstValueFrom(activeLibraryProject$.pipe(switchMap((lp) => lp.project$)))
          );
          return project;
        });
      }
    };
});

export const LibraryCtxLive = Layer.effect(
  LibraryCtx,
  ctxEffect
);

