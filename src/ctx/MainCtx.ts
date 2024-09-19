import { Effect, Layer } from "effect";
import { ExObjectFocusCtx } from "src/focus/ExObjectFocusCtx";
import { ExprFocusCtx } from "src/focus/ExprFocus";
import { FocusCtx } from "src/focus/FocusCtx";
import { LoadCtx } from "src/utils/persistence/LoadCtx";
import { LibraryPersistCtx } from "src/utils/persistence/LibraryPersistCtx";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { map, merge, mergeAll, mergeMap, switchMap } from "rxjs";
import Dehydrator from "src/hydration/Dehydrator";

export class MainCtx extends Effect.Tag("MainCtx")<
  MainCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  yield* FocusCtx.register();
  yield* ExprFocusCtx.register();
  yield* ExObjectFocusCtx.register();

  const dehydrator = new Dehydrator();
  const loadCtx = yield* LoadCtx;
  const libraryPersistCtx = yield* LibraryPersistCtx;
  const libraryCtx = yield* LibraryCtx;
  const libraryProjectCtx = yield* LibraryProjectCtx;

  // Load projects from persistence and add them to the library
  yield* Effect.gen(function* () {
    const activeLibraryProjectId =
      yield* libraryPersistCtx.readActiveLibraryProjectId();
    const libraryProjects = yield* loadCtx.loadProjects();
    const library = yield* libraryCtx.library;

    for (const project of libraryProjects) {
      library.libraryProjects.push(project);
      if (project.id === activeLibraryProjectId) {
        libraryProjectCtx.activeLibraryProject$.next(project);
      }
    }
  });

  // Save projects to persistence when they change
  yield* Effect.gen(function* () {
    const library = yield* libraryCtx.library;
    library.libraryProjects.items$.pipe(
      switchMap((libraryProjects) => {
        const vv = libraryProjects.map((libraryProject) => {
          const deProject$ = dehydrator.dehydrateLibraryProject$(libraryProject);
          return deProject$;
        });
        return merge(...vv);
      }),
      map((deProject) => {
        return loadCtx.saveProject(deProject);
      }),
    )
  });

  return {};
});

export const MainCtxLive = Layer.effect(MainCtx, ctxEffect);
