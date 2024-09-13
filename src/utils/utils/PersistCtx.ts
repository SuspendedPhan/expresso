import { Effect, Layer } from "effect";
import { debounceTime, switchMap } from "rxjs";
import { Project } from "src/ex-object/Project";
import Dehydrator from "src/hydration/Dehydrator";
import { log5 } from "src/utils/utils/Log5";

// const reset = true;
// const reset = false;

const log55 = log5("Persist.ts");

export class PersistCtx extends Effect.Tag("PersistCtx")<
  PersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {

  // FirebaseAuthentication.userLoggedIn$.subscribe(() => {
  //   complete: () => {
  //     log55.debug("User logged in");
  //   }
  // });

  // Persistence.readProject$.subscribe(async (deProject) => {
  //   if (deProject === null || reset) {
  //     log55.debug("No project found, creating blank project");
  //     const library = await firstValueFrom(ctx.library$);
  //     library.addProjectBlank();
  //     return;
  //   }

  //   const project = await new Rehydrator(ctx).rehydrateProject(deProject);
  //   (ctx.projectManager.currentLibraryProject$ as Subject<LibraryProject>).next(
  //     project
  //   );

  //   log55.debug("Project loaded", project);
  // });

  const dehydrator = new Dehydrator();

  (yield* Project.activeProject$)
    .pipe(
      switchMap((project) => dehydrator.dehydrateProject$(project)),
      log55.tapDebug("Pre-bounce"),
      debounceTime(1000),
      log55.tapDebug("Post-bounce")
    )
    .subscribe((deProject) => {
      log55.debug("Persisting project", deProject);
      // Persistence.writeProject(deProject);
    });
  return {};
});

export const PersistCtxLive = Layer.effect(PersistCtx, ctxEffect);
