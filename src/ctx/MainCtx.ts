import { Effect, Layer, Option, Stream } from "effect";
import { merge, switchMap } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { Library } from "src/ex-object/Library";
import { ExObjectFocusCtx } from "src/focus/ExObjectFocusCtx";
import { ExprFocusCtx } from "src/focus/ExprFocus";
import { FocusCtx } from "src/focus/FocusCtx";
import Dehydrator from "src/hydration/Dehydrator";
import { LibraryPersistCtx } from "src/utils/persistence/LibraryPersistCtx";
import { LoadCtx } from "src/utils/persistence/LoadCtx";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("MainCtx.ts");

export class MainCtx extends Effect.Tag("MainCtx")<
  MainCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect_ = Effect.gen(function* () {
  yield* FocusCtx.register();
  yield* ExprFocusCtx.register();
  yield* ExObjectFocusCtx.register();

  // yield* GoBridgeCtx;

  const dehydrator = new Dehydrator();
  const loadCtx = yield* LoadCtx;
  const libraryPersistCtx = yield* LibraryPersistCtx;
  const libraryCtx = yield* LibraryCtx;
  const libraryProjectCtx = yield* LibraryProjectCtx;

  // Load projects from persistence and add them to the library
  yield* Effect.gen(function* () {
    log55.debug("Loading projects from persistence");

    const activeLibraryProjectId =
      yield* libraryPersistCtx.readActiveLibraryProjectId();

    log55.debug("Active library project ID", activeLibraryProjectId);
    const libraryProjects = yield* loadCtx.loadProjects();
    const library = yield* libraryCtx.library;

    if (libraryProjects.length === 0) {
      log55.debug("No projects found, adding blank project");
      const libraryProject = yield* Library.Methods(library).addProjectBlank();
      libraryProjectCtx.activeLibraryProject$.next(libraryProject);
      return;
    }

    for (const project of libraryProjects) {
      yield* library.libraryProjects.push(project);
      if (project.id === Option.getOrUndefined(activeLibraryProjectId)) {
        libraryProjectCtx.activeLibraryProject$.next(project);
      }
    }
  });

  // Save projects to persistence when they change
  yield* Effect.gen(function* () {
    log55.debug("Saving library project: start subscription");
    const library = yield* libraryCtx.library;


    const dehydratedLibraryProject$ = library.libraryProjects.items$.pipe(
      // log55.tapDebug(
      //   "Saving library project: detected library projects change"
      // ),
      switchMap((libraryProjects) => {
        const vv = libraryProjects.map((libraryProject) => {
          log55.debug("Saving library project: dehydrating library project");
          const deProject$ =
            dehydrator.dehydrateLibraryProject$(libraryProject);
          return deProject$;
        });
        return merge(...vv);
      }),
      log55.tapDebug("Saving library project: dehydrated library project")
    );

    const dehydratedLibraryProjectStream = EffectUtils.obsToStream(
      dehydratedLibraryProject$
    );

    yield* Effect.forkDaemon(
      Stream.runForEach(
        dehydratedLibraryProjectStream,
        (dehydratedLibraryProject) => {
          return Effect.gen(function* () {
            log55.debug("Saving library project: saving to persistence");
            yield* loadCtx.saveProject(dehydratedLibraryProject);
          });
        }
      )
    ).pipe(
      Effect.catchAll((error) => {
        return Effect.gen(function* () {
          log55.error("Error saving library project", error);
        });
      })
    );
  });

  // Save active project ID to persistence when it changes
  yield* Effect.gen(function* () {
    log55.debug("Saving active library project ID: start subscription");
    const libraryProject$ = libraryProjectCtx.activeLibraryProject$;
    const libraryProjectStream = EffectUtils.obsToStream(libraryProject$);
    yield* Effect.forkDaemon(
      Stream.runForEach(libraryProjectStream, (libraryProject) => {
        return Effect.gen(function* () {
          log55.debug(
            "Saving active library project ID: saving to persistence"
          );
          yield* libraryPersistCtx.writeActiveLibraryProjectId(
            libraryProject.id
          );
        });
      })
    );
  });

  log55.debug("MainCtx initialized");
  return {};
});

const ctxEffect = ctxEffect_;

export const MainCtxLive = Layer.effect(MainCtx, ctxEffect);
