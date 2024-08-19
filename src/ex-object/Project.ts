import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";
import { CreateComponent, type CustomComponent } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import { createBehaviorSubjectWithLifetime, type Destroyable, type SUB } from "src/utils/utils/Utils";

export interface Project extends Destroyable {
  readonly libraryProject: LibraryProject;
  readonly rootExObjects$: SUB<readonly ExObject[]>;
  readonly componentArr$: SUB<CustomComponent[]>;
  readonly currentOrdinal$: SUB<number>;
}

export function createProjectContext(ctx: MainContext) {
  return {
    currentProject$: ctx.projectManager.currentProject$,
  };
}

export namespace ProjectFns {
  export async function getAndIncrementOrdinal(
    project: Project
  ): Promise<number> {
    const ordinal = await firstValueFrom(project.currentOrdinal$);
    project.currentOrdinal$.next(ordinal + 1);
    return ordinal;
  }

  export async function addComponentBlank(ctx: MainContext, project: Project) {
    const componentL = await firstValueFrom(project.componentArr$);
    const component = await CreateComponent.customBlank(ctx);
    componentL.push(component);
    project.componentArr$.next(componentL);
    return component;
  }
}

export namespace CreateProject {
  export function from(libraryProject: LibraryProject, rootObjects: readonly ExObject[]): Project {
    const destroy$ = new Subject<void>();

    const project: Project = {
      destroy$,
      libraryProject,
      rootExObjects$: createBehaviorSubjectWithLifetime(destroy$, rootObjects),
      componentArr$: new BehaviorSubject<CustomComponent[]>([]),
      currentOrdinal$: new BehaviorSubject<number>(0),
    };

    return project;
  }
}