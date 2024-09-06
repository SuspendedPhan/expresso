import { BehaviorSubject, Subject } from "rxjs";
import { ProjectFactory2 } from "src/ex-object/Project";
import { createLibraryProject, type LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import { fields, variation } from "variant";

const log55 = log5("Library.ts");

interface Library_ {
  projectOrdinal$: BehaviorSubject<number>;
  libraryProjectArr$: BehaviorSubject<LibraryProject[]>;

  destroy$: Subject<void>;

  addProject(libraryProject: LibraryProject): void;
  addProjectBlank(): Promise<void>;
}

export const LibraryFactory = variation("Library", fields<Library_>());
export type Library = ReturnType<typeof LibraryFactory>;

interface LibraryCreationArgs {
  projectOrdinal?: number;
  libraryProjectArr?: LibraryProject[];
}

export async function LibraryFactory2(ctx: MainContext, creationArgs: LibraryCreationArgs) {
  const creationArgs2: Required<LibraryCreationArgs> = {
    projectOrdinal: creationArgs.projectOrdinal ?? 0,
    libraryProjectArr: creationArgs.libraryProjectArr ?? [],
  };

  const library = LibraryFactory({
    projectOrdinal$: new BehaviorSubject<number>(creationArgs2.projectOrdinal),
    libraryProjectArr$: new BehaviorSubject<LibraryProject[]>(creationArgs2.libraryProjectArr),

    destroy$: new Subject<void>(),

    addProject(libraryProject: LibraryProject) {
      log55.debug("addProject");
      const libraryProjectArr = this.libraryProjectArr$.value;
      libraryProjectArr.push(libraryProject);
      this.libraryProjectArr$.next(libraryProjectArr);
      ctx.projectManager.currentLibraryProject$.next(libraryProject);
    },

    async addProjectBlank() {
      log55.debug("addProjectBlank");
      const ordinal = getAndIncrementOrdinal(this.projectOrdinal$);
      const name = `Project ${ordinal}`;
      const project = ProjectFactory2(ctx, {});
      const libraryProject = await createLibraryProject(ctx, { project, name });
      this.addProject(libraryProject);
    }
  });
  
  return library;
}

function getAndIncrementOrdinal(ordinal$: BehaviorSubject<number>) {
  const ordinal = ordinal$.value + 1;
  ordinal$.next(ordinal);
  return ordinal;
}