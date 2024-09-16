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
import Persistence from "src/utils/persistence/Persistence";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { log5 } from "src/utils/utils/Log5";

// const reset = true;
const reset = false;

const log55 = log5("Persist.ts");

export class PersistCtx extends Effect.Tag("PersistCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  FirebaseAuthentication.userLoggedIn$.subscribe(() => {
    complete: () => {
      log55.debug("User logged in");
    };
  });

  Persistence.listFiles();

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const project = yield* PersistCtx0.readProject("test-id");
      if (project === null || reset) {
        log55.debug("No project found, creating blank project");
        const library = yield* LibraryCtx.library;
        const libraryProject = yield* Library.Methods(
          library
        ).addProjectBlank();
        (yield* LibraryProjectCtx.activeLibraryProject$).next(libraryProject);
        return;
      }

      const libraryProject = yield* LibraryProjectFactory2({
        id: "test-id",
        project,
      });
      (yield* LibraryCtx.library).libraryProjects.push(libraryProject);
      (yield* LibraryProjectCtx.activeLibraryProject$).next(libraryProject);

      log55.debug("Project loaded", project);
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
      DexRuntime.runPromise(PersistCtx0.writeProject("test-id", deProject));
    });

  return {};
});

export const PersistCtxLive = Layer.effect(PersistCtx, ctxEffect);
