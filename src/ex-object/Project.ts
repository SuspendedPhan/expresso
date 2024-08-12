import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";
import type { Component } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import type { LibraryProject } from "src/library/LibraryProject";
import { createBehaviorSubjectWithLifetime, type Destroyable, type SUB } from "src/utils/utils/Utils";

export interface Project extends Destroyable {
  readonly libraryProject: LibraryProject;
  readonly rootExObjects$: SUB<readonly ExObject[]>;
  readonly components$: SUB<Component[]>;
  readonly currentOrdinal$: SUB<number>;
}

export namespace ProjectFns {
  export async function getAndIncrementOrdinal(
    project: Project
  ): Promise<number> {
    const ordinal = await firstValueFrom(project.currentOrdinal$);
    project.currentOrdinal$.next(ordinal + 1);
    return ordinal;
  }
}

export namespace CreateProject {
  export function from(libraryProject: LibraryProject, rootObjects: readonly ExObject[]): Project {
    const destroy$ = new Subject<void>();

    const project: Project = {
      destroy$,
      libraryProject,
      rootExObjects$: createBehaviorSubjectWithLifetime(destroy$, rootObjects),
      components$: new BehaviorSubject<Component[]>([]),
      currentOrdinal$: new BehaviorSubject<number>(0),
    };

    return project;
  }
}