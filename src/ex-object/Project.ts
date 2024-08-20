import { BehaviorSubject, firstValueFrom, ReplaySubject, Subject } from "rxjs";
import { CreateComponent, type CustomComponent } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import type { ArrayEvent } from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils
} from "src/utils/utils/Utils";


export type Project = ReturnType<typeof CreateProject.from>;

export function createProjectContext(ctx: MainContext) {
  return {
    currentProject$: ctx.projectManager.currentProject$,
    async getOrdinalProm() {
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      return ProjectFns.getAndIncrementOrdinal(project);
    },
    async getCurrentProjectProm() {
      return firstValueFrom(ctx.projectManager.currentProject$);
    }
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
    const component = await CreateComponent.custom(ctx, {});
    addComponent(ctx, project, component);
    return component;
  }

  export async function addComponent(
    _ctx: MainContext,
    project: Project,
    component: CustomComponent
  ) {
    const componentL = await firstValueFrom(project.componentArr$);
    componentL.push(component);
    project.componentArr$.next(componentL);
  }
}

export namespace CreateProject {
  export function from(
    _ctx: MainContext,
    data?: {
      rootExObjects?: ExObject[];
      componentArr?: CustomComponent[];
      currentOrdinal?: number;
    }
  ) {
    data ??= {};
    
    const destroy$ = new Subject<void>();
    const project = {
      id: Utils.createId("project"),
      libraryProject: null as LibraryProject | null,
      rootExObjects$: createBehaviorSubjectWithLifetime(destroy$, data.rootExObjects ?? []),
      componentArr$: new BehaviorSubject<CustomComponent[]>(data.componentArr ?? []),
      currentOrdinal$: new BehaviorSubject<number>(data.currentOrdinal ?? 0),

      rootExObjectArrEvt$: new ReplaySubject<ArrayEvent<ExObject>>(1),
      destroy$,
    };

    return project;
  }
}
