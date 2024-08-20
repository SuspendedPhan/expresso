import { debounceTime, Subject, switchMap } from "rxjs";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import Dehydrator from "src/utils/hydration/Dehydrator";
import Rehydrator from "src/utils/hydration/Rehydrator";
import Persistence from "src/utils/persistence/Persistence";
import { log5 } from "src/utils/utils/Log2";

const reset = true;
// const reset = false;

const log55 = log5("PersistCtx.ts");

export function createPersistCtx(ctx: MainContext) {
  Persistence.readProject$.subscribe(async (deProject) => {
    if (deProject === null || reset) {
      ctx.projectManager.addProjectNew();
      return;
    }

    const project = await new Rehydrator(ctx).rehydrateProject(deProject);
    (ctx.projectManager.currentLibraryProject$ as Subject<LibraryProject>).next(
      project
    );
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
