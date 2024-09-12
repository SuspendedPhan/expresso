import { Effect, Layer } from "effect";
import { firstValueFrom, switchMap, tap } from "rxjs";
import { LibraryProjectCtx, LibraryProjectCtxLive } from "src/ctx/LibraryProjectCtx";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import { log5 } from "src/utils/utils/Log5";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class ProjectCtx extends Effect.Tag("ProjectCtx")<
  ProjectCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const log55 = log5("ProjectCtx.ts");

const ctxEffect = Effect.gen(function* () {
  const libraryProjectCtx = yield* LibraryProjectCtx;
  const activeLibraryProject$ = libraryProjectCtx.activeLibraryProject$;
  return {
    activeProject$: activeLibraryProject$.pipe(
      switchMap((libraryProject) => libraryProject.project$)
    ),

    get activeProject() {
      log55.debug("activeProject");
      return Effect.gen(function* () {
        log55.debug("activeProject2");
        const project = yield* Effect.promise(() =>
          firstValueFrom(
            activeLibraryProject$.pipe(
              tap((lp) => log55.debug("activeProject3", lp)),
              switchMap((lp: LibraryProject) => lp.project$),
              tap((p) => log55.debug("activeProject4", p))
            )
          )
        );
        log55.debug("activeProject5", project);
        return project;
      });
    },
  };
});

export const ProjectCtxLive = Layer.effect(ProjectCtx, ctxEffect).pipe(
  Layer.provideMerge(LibraryProjectCtxLive)
);
