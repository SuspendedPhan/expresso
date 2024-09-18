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
import { Persist0Ctx } from "src/utils/persistence/Persist0Ctx";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { log5 } from "src/utils/utils/Log5";

// const reset = true;
// const reset = false;

const log55 = log5("PersistCtx.ts");

export class PersistCtx extends Effect.Tag("PersistCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const libraryCtx = yield* LibraryCtx;
  const libraryProjectCtx = yield* LibraryProjectCtx;
  const persist0Ctx = yield* Persist0Ctx;

  FirebaseAuthentication.userLoggedIn$.subscribe(() => {
    complete: () => {
      log55.debug("User logged in");
    };
  });

  const libraryProjectList = persist0Ctx.readLibraryProjectList();
  yield* Effect.matchEffect(libraryProjectList, {
    onSuccess: (libraryProjectList) => {
      return Effect.gen(function* () {
        log55.debug("Library project list found", libraryProjectList);
        for (const dehydratedLibraryProject of libraryProjectList) {
          const library = yield* libraryCtx.library;
          if (library.libraryProjectById.has(dehydratedLibraryProject.id)) {
            log55.debug("Library project already loaded", dehydratedLibraryProject.id);
            continue;
          }

          const libraryProject = yield* LibraryProjectFactory2(dehydratedLibraryProject);
          (yield* libraryCtx.library).libraryProjects.push(libraryProject);
        }
      });
    },
    onFailure: () => {
      return Effect.gen(function* () {
        log55.debug("Project list failed");
      });
    },
  });

  const activeLibraryProjectId = persist0Ctx.readActiveLibraryProjectId();

  yield* Effect.matchEffect(activeLibraryProjectId, {
    onSuccess: (activeLibraryProjectId) => {
      log55.debug("Active library project found", activeLibraryProjectId);
      const project = persist0Ctx.readProject(activeLibraryProjectId);
      return Effect.matchEffect(project, {
        onSuccess: (project) => {
          return Effect.gen(function* () {
            const libraryProject = yield* LibraryProjectFactory2({
              id: activeLibraryProjectId,
              project,
            });
            log55.debug("LibraryProject loaded and created", libraryProject);

            (yield* libraryCtx.library).libraryProjects.push(libraryProject);
            libraryProjectCtx.activeLibraryProject$.next(
              libraryProject
            );
          });
        },
        onFailure: () => {
          return createBlankProject();
        },
      });
    },
    onFailure: () => {
      log55.debug("No active library project found");
      return createBlankProject();
    },
  });

  log55.debug("Subscribing to project changes");
  const dehydrator = new Dehydrator();
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
      DexRuntime.runPromise(
        persist0Ctx.writeProject(libraryProject.id, deProject)
      );
      DexRuntime.runPromise(
        persist0Ctx.writeActiveLibraryProjectId(libraryProject.id)
      );
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
