import {
  BehaviorSubject,
  first,
  map,
  Observable,
  ReplaySubject,
  switchMap,
} from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import { CreateProject, type Project } from "src/ex-object/Project";
import MainContext from "src/main-context/MainContext";

export interface LibraryProject {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
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

  public constructor(private readonly _ctx: MainContext) {}

  public addProjectNew(): LibraryProject {
    // Get date/time with YYYY:MM:DD-HH:MM format
    const date = new Date();
    const timestamp = `${date.getFullYear()}:${date.getMonth()}:${date.getDate()}-${date.getHours()}:${date.getMinutes()}`;
    const id = `${timestamp}-${crypto.randomUUID()}`;
    const name = `Project ${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    return this.addProject(id, name, []);
  }

  public addProject(
    id: string,
    name: string,
    rootObjects: ExObject[]
  ): LibraryProject {
    const libraryProject: LibraryProject = {
      id,
      name,
      project$: new ReplaySubject<Project>(1),
    };

    const project = CreateProject.from(libraryProject, rootObjects);
    libraryProject.project$.next(project);
    this.libraryProjectsSub$.next([
      ...this.libraryProjectsSub$.value,
      libraryProject,
    ]);
    this.currentLibraryProject$.next(libraryProject);
    return libraryProject;
  }

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
