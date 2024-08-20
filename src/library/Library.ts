import { Subject } from "rxjs";
import { CreateProject } from "src/ex-object/Project";
import { createLibraryProject, type LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log3";
import { createBehaviorSubjectWithLifetime } from "src/utils/utils/Utils";

const log55 = log5("Library.ts");

export type Library = ReturnType<typeof createLibrary>;

export function createLibrary(
  ctx: MainContext,
  data: {
    projectOrdinal?: number;
    libraryProjectArr?: LibraryProject[];
  }
) {
  const destroy$ = new Subject<void>();
  return {
    projectOrdinal$: createBehaviorSubjectWithLifetime(
      destroy$,
      data.projectOrdinal ?? 0
    ),
    libraryProjectArr$: createBehaviorSubjectWithLifetime(
      destroy$,
      data.libraryProjectArr ?? []
    ),

    destroy$,

    addProject(libraryProject: LibraryProject) {
      log55.debug("addProject");
      const libraryProjectArr = this.libraryProjectArr$.value;
      libraryProjectArr.push(libraryProject);
      this.libraryProjectArr$.next(libraryProjectArr);
      ctx.projectManager.currentLibraryProject$.next(libraryProject);
    },

    async addProjectBlank() {
      log55.debug("addProjectBlank");
      const project = CreateProject.from(ctx, {});
      const libraryProject = await createLibraryProject(ctx, { project });
      this.addProject(libraryProject);
    }
  };
}
