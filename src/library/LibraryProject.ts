import {
  BehaviorSubject,
  first,
  firstValueFrom,
  map,
  Observable,
  ReplaySubject,
  switchMap,
} from "rxjs";
import { type Project } from "src/ex-object/Project";
import MainContext from "src/main-context/MainContext";
import { Utils } from "src/utils/utils/Utils";
import { variation, fields } from "variant";

export interface LibraryProject_ {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
}

export const LibraryProjectFactory = variation("LibraryProject", fields<LibraryProject_>());
export type LibraryProject = ReturnType<typeof LibraryProjectFactory>;

interface LibraryProjectCreationArgs {
  id?: string;
  name?: string;
  project?: Project|null;
}

export async function LibraryProjectFactory2(
  ctx: MainContext,
  creationArgs: LibraryProjectCreationArgs
) {
  const library = await firstValueFrom(ctx.library$);
  const ordinal = await firstValueFrom(library.projectOrdinal$);

  const creationArgs2: Required<LibraryProjectCreationArgs> = {
    id: creationArgs.id ?? Utils.createId("library-project"),
    name: creationArgs.name ?? `Project ${ordinal}`,
    project: creationArgs.project ?? null,
  };

  const project$ = new ReplaySubject<Project>(1);
  const libraryProject = LibraryProjectFactory({
    id: creationArgs2.id,
    name: creationArgs2.name,
    project$,
  });

  if (creationArgs2.project !== null) {
    project$.next(creationArgs2.project);
    creationArgs2.project.libraryProject = libraryProject;
  }

  return libraryProject;
}

export class ProjectManager {
  public readonly libraryProjectsSub$ = new BehaviorSubject<
    readonly LibraryProject[]
  >([]);
  public readonly libraryProjects$ = this.libraryProjectsSub$.asObservable();

  public readonly currentLibraryProject$ = new ReplaySubject<LibraryProject>(1);
  public readonly currentProject$ = this.currentLibraryProject$.pipe(
    switchMap((libraryProject) => libraryProject.project$)
  );

  public constructor() {}

  public getFirstProject$(): Observable<LibraryProject | null> {
    return this.libraryProjects$.pipe(
      first(),
      map((projects) => {
        return projects[0] ?? null;
      })
    );
  }

  public getNextProject$(project: LibraryProject): Observable<LibraryProject> {
    return this.libraryProjects$.pipe(
      first(),
      map((projects) => {
        const index = projects.indexOf(project);
        if (index === -1) {
          throw new Error("Project not found");
        }
        const nextIndex = (index + 1) % projects.length;
        const nextProject = projects[nextIndex];
        if (nextProject === undefined) {
          throw new Error("No next project");
        }
        return nextProject;
      })
    );
  }

  public getPrevProject$(project: LibraryProject): Observable<LibraryProject> {
    return this.libraryProjects$.pipe(
      first(),
      map((projects) => {
        const index = projects.indexOf(project);
        if (index === -1) {
          throw new Error("Project not found");
        }
        const prevIndex = (index - 1 + projects.length) % projects.length;
        const prevProject = projects[prevIndex];
        if (prevProject === undefined) {
          throw new Error("No previous project");
        }
        return prevProject;
      })
    );
  }
}
