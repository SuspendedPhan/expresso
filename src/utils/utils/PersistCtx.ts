// @ts-nocheck

import { debounceTime, firstValueFrom, Subject, switchMap } from "rxjs";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import Dehydrator from "src/hydration/Dehydrator";
import Rehydrator from "src/hydration/Rehydrator";
import { FirebaseAuthentication } from "src/utils/persistence/FirebaseAuthentication";
import Persistence from "src/utils/persistence/Persistence";
import { log5 } from "src/utils/utils/Log5";

// const reset = true;
const reset = false;

const log55 = log5("PersistCtx.ts");

export async function createPersistCtx(ctx: MainContext) {
  FirebaseAuthentication.userLoggedIn$.subscribe(() => {
    complete: () => {
      log55.debug("User logged in");
    }
  });

  Persistence.readProject$.subscribe(async (deProject) => {
    if (deProject === null || reset) {
      log55.debug("No project found, creating blank project");
      const library = await firstValueFrom(ctx.library$);
      library.addProjectBlank();
      return;
    }

    const project = await new Rehydrator(ctx).rehydrateProject(deProject);
    (ctx.projectManager.currentLibraryProject$ as Subject<LibraryProject>).next(
      project
    );

    log55.debug("Project loaded", project);
  });

  const dehydrator = new Dehydrator();
  ctx.projectManager.currentProject$
    .pipe(
      switchMap((project) => dehydrator.dehydrateProject$(project)),
      log55.tapDebug("Pre-bounce"),
      debounceTime(1000),
      log55.tapDebug("Post-bounce")
    )
    .subscribe((deProject) => {
      Persistence.writeProject(deProject);
    });
  return {};
}
