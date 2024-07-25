import { BehaviorSubject, ReplaySubject } from "rxjs";
import { Component, Project } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";

export interface LibraryProject {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
}

export class LibraryProjectManager {
  public readonly projectsSub$ = new BehaviorSubject<readonly LibraryProject[]>(
    []
  );
  public readonly projects$ = this.projectsSub$.asObservable();

  public constructor(private readonly ctx: MainContext) {}

  public addProjectNew(): Project {
    // Get date/time with YYYY:MM:DD-HH:MM format
    const date = new Date();
    const timestamp = `${date.getFullYear()}:${date.getMonth()}:${date.getDate()}-${date.getHours()}:${date.getMinutes()}`;
    const id = `${timestamp}-${crypto.randomUUID()}`;
    const name = `Project ${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    return this.addProject(id, name, []);
  }

  addProject(id: string, name: string, rootComponents: Component[]): Project {
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
    this.projectsSub$.next([...this.projectsSub$.value, libraryProject]);
    return project;
  }
}
