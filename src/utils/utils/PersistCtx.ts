import { debounceTime, Subject, switchMap } from "rxjs";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import Dehydrator from "src/utils/hydration/Dehydrator";
import Rehydrator from "src/utils/hydration/Rehydrator";
import Persistence from "src/utils/persistence/Persistence";

const reset = true;
// const reset = false;

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
      debounceTime(1000)
    )
    .subscribe((deProject) => {
      Persistence.writeProject(deProject);
    });
  return {};
}
