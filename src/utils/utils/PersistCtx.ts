import assert from "assert-ts";
import { Effect, Layer } from "effect";
import { debounceTime, map, switchMap } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { Library } from "src/ex-object/Library";
import { LibraryProjectFactory2 } from "src/ex-object/LibraryProject";
import { Project } from "src/ex-object/Project";
import Dehydrator from "src/hydration/Dehydrator";
import { FirebaseAuthentication } from "src/utils/persistence/FirebaseAuthentication";
import { PersistCtx0 } from "src/utils/persistence/PersistCtx0";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { log5 } from "src/utils/utils/Log5";

// const reset = true;
const reset = false;

const log55 = log5("PersistCtx.ts");

export class PersistCtx extends Effect.Tag("PersistCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const libraryCtx = yield* LibraryCtx;
  const libraryProjectCtx = yield* LibraryProjectCtx;
  const persistCtx0 = yield* PersistCtx0;

  FirebaseAuthentication.userLoggedIn$.subscribe(() => {
    complete: () => {
      log55.debug("User logged in");
    };
  });

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const activeLibraryProjectId =
        yield* persistCtx0.readActiveLibraryProjectId();
      if (activeLibraryProjectId === null) {
        log55.debug("No active library project found");
        return yield* createBlankProject();
      }

      const project = yield* persistCtx0.readProject(activeLibraryProjectId);
      if (project === null || reset) {
        return yield* createBlankProject();
      }

      const libraryProject = yield* LibraryProjectFactory2({
        id: activeLibraryProjectId,
        project,
      });
      log55.debug("LibraryProject loaded and created", libraryProject);

      (yield* LibraryCtx.library).libraryProjects.push(libraryProject);
      (yield* LibraryProjectCtx.activeLibraryProject$).next(libraryProject);
    })
  );

  const dehydrator = new Dehydrator();

  log55.debug("Subscribing to project changes");
  (yield* Project.activeProject$)
    .pipe(
      log55.tapDebug("Project changed"),
      switchMap((project) =>
        dehydrator
          .dehydrateProject$(project)
          .pipe(map((deProject) => ({ project, deProject })))
      ),
      log55.tapDebug("Pre-bounce"),
      debounceTime(1000),
      log55.tapDebug("Post-bounce")
    )
    .subscribe(({ project, deProject }) => {
      log55.debug("Persisting project", deProject);
      const { libraryProject } = project;
      assert(libraryProject !== null);
      DexRuntime.runPromise(PersistCtx0.writeProject(libraryProject.id, deProject));
      DexRuntime.runPromise(PersistCtx0.writeActiveLibraryProjectId(libraryProject.id));
    });

  return {};

  function createBlankProject() {
    return Effect.gen(function* () {
      log55.debug("No project found, creating blank project");
      const libraryProject = yield* Library.Methods(
        yield* libraryCtx.library
      ).addProjectBlank();
      libraryProjectCtx.activeLibraryProject$.next(libraryProject);
    });
  }
});

export const PersistCtxLive = Layer.effect(PersistCtx, ctxEffect);
