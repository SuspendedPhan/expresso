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

export interface LibraryProject {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
}

export async function createLibraryProject(
  ctx: MainContext,
  data: {
    id?: string;
    name?: string;
    project?: Project;
  }
) {
  const library = await firstValueFrom(ctx.library$);
  const ordinal = await firstValueFrom(library.projectOrdinal$);
  return {
    id: data.id ?? Utils.createId("library-project"),
    name: data.name ?? `Project ${ordinal}`,
    project$: new ReplaySubject<Project>(1),
  };
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
