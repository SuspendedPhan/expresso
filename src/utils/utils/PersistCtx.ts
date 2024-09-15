import { Effect, Layer } from "effect";
import { debounceTime, switchMap } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { Library } from "src/ex-object/Library";
import { Project } from "src/ex-object/Project";
import Dehydrator from "src/hydration/Dehydrator";
import createRehydrator from "src/hydration/Rehydrator";
import { FirebaseAuthentication } from "src/utils/persistence/FirebaseAuthentication";
import Persistence from "src/utils/persistence/Persistence";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { log5 } from "src/utils/utils/Log5";

const reset = true;
// const reset = false;

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

  Persistence.readProject$.subscribe((deProject) => {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        if (deProject === null || reset) {
          log55.debug("No project found, creating blank project");
          const library = yield* LibraryCtx.library;
          const libraryProject = yield* Library.Methods(library).addProjectBlank();
          (yield* LibraryProjectCtx.activeLibraryProject$).next(libraryProject);
          return;
        }

        const project = yield* createRehydrator().rehydrateProject(deProject);
        (yield* LibraryProjectCtx.activeLibraryProject$).next(project);

        log55.debug("Project loaded", project);
      })
    );
  });

  const dehydrator = new Dehydrator();

  log55.debug("Subscribing to project changes");
  (yield* Project.activeProject$)
    .pipe(
      log55.tapDebug("Project changed"),
      switchMap((project) => dehydrator.dehydrateProject$(project)),
      log55.tapDebug("Pre-bounce"),
      debounceTime(1000),
      log55.tapDebug("Post-bounce")
    )
    .subscribe((deProject) => {
      log55.debug("Persisting project", deProject);
      Persistence.writeProject(deProject);
    });
  return {};
});

export const PersistCtxLive = Layer.effect(PersistCtx, ctxEffect);
