import { Context, Effect, Layer } from "effect";
import { firstValueFrom, switchMap } from "rxjs";
import { LibraryProjectCtx, LibraryProjectCtxLive } from "src/ctx/LibraryProjectCtx";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class ProjectCtx extends Context.Tag("ProjectCtx")<
  ProjectCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const libraryProjectCtx = yield* LibraryProjectCtx;
  const activeLibraryProject$ = libraryProjectCtx.activeLibraryProject$;
  return {
    activeProject$: activeLibraryProject$.pipe(
      switchMap((libraryProject) => libraryProject.project$)
    ),

    get activeProject() {
      return Effect.gen(function* () {
        const project = yield* Effect.promise(() =>
          firstValueFrom(
            activeLibraryProject$.pipe(
              switchMap((lp: LibraryProject) => lp.project$)
            )
          )
        );
        return project;
      });
    },
  };
});

export const ProjectCtxLive = Layer.effect(ProjectCtx, ctxEffect).pipe(
  Layer.provideMerge(LibraryProjectCtxLive)
);
