import { BehaviorSubject, first, map, Observable, ReplaySubject, switchMap } from "rxjs";
import { Component, Project } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";

export interface LibraryProject {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
}

export class ProjectManager {
  getNextProject$(project: LibraryProject) : Observable<LibraryProject> {
    return this.libraryProjects$.pipe(first(), map((projects) => {
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
    }));
  }
  public readonly libraryProjectsSub$ = new BehaviorSubject<
    readonly LibraryProject[]
  >([]);
  public readonly libraryProjects$ = this.libraryProjectsSub$.asObservable();
  
  public readonly currentLibraryProject$ = new ReplaySubject<LibraryProject>(1);
  public readonly currentProject$ = this.currentLibraryProject$.pipe(
    switchMap((libraryProject) => libraryProject.project$)
  );

  public constructor(private readonly ctx: MainContext) {}

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
    rootComponents: Component[]
  ): LibraryProject {
    const libraryProject: LibraryProject = {
      id,
      name,
      project$: new ReplaySubject<Project>(1),
    };

    const project = this.ctx.objectFactory.createProject(
      libraryProject,
      rootComponents
    );
    libraryProject.project$.next(project);
    this.libraryProjectsSub$.next([
      ...this.libraryProjectsSub$.value,
      libraryProject,
    ]);
    this.currentLibraryProject$.next(libraryProject);
    return libraryProject;
  }
}
