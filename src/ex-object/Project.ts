import { Effect } from "effect";
import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";
import { ComponentFactory2, type ComponentKind } from "src/ex-object/Component";
import { ExFuncFactory2, type ExFunc } from "src/ex-object/ExFunc";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObjectFactory2, type ExObject } from "src/ex-object/ExObject";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import { Utils, type OBS } from "src/utils/utils/Utils";
import { fields, variation } from "variant";

export const ProjectFactory = variation(
  "Project",
  fields<
    {
      libraryProject: LibraryProject | null;
      rootExObjects: ObservableArray<ExObject>;
      componentArr$: BehaviorSubject<ComponentKind["Custom"][]>;
      exFuncObsArr: ObservableArray<ExFunc>;
      currentOrdinal$: BehaviorSubject<number>;
      rootExObjects$: OBS<ExObject[]>;
      destroy$: Subject<void>;

      addRootExObjectBlank(): Promise<void>;
      addCustomExFunc(exFunc: ExFunc): Promise<void>;
      getAndIncrementOrdinal(project: Project): Promise<number>;
      
      // addComponentBlank(ctx: MainContext, project: Project): Promise<ComponentKind["Custom"]>;
      // addComponent(ctx: MainContext, project: Project, component: ComponentKind["Custom"]): Promise<void>;
    } & ExItemBase
  >()
);

export type Project = ReturnType<typeof ProjectFactory>;

interface ProjectCreationArgs {
  id?: string;
  rootExObjects?: ExObject[];
  componentArr?: ComponentKind["Custom"][];
  exFuncArr?: ExFunc[];
  currentOrdinal?: number;
}

export async function ProjectFactory2(
  ctx: MainContext,
  creationArgs: ProjectCreationArgs
) {
  const currentOrdinal = creationArgs.currentOrdinal ?? 0;
  const creationArgs2: Required<ProjectCreationArgs> = {
    id: creationArgs.id ?? Utils.createId("project"),
    rootExObjects: creationArgs.rootExObjects ?? [],
    componentArr: creationArgs.componentArr ?? [],
    exFuncArr: creationArgs.exFuncArr ?? [],
    currentOrdinal: creationArgs.currentOrdinal ?? 0,
  };

  const base = await ExItem.createExItemBase(creationArgs2.id);

  const rootExObjects = createObservableArrayWithLifetime<ExObject>(
    base.destroy$,
    creationArgs2.rootExObjects
  );

  const currentOrdinal$ = new BehaviorSubject<number>(currentOrdinal);

  const project = ProjectFactory({
    ...base,
    libraryProject: null,
    rootExObjects: rootExObjects,
    componentArr$: new BehaviorSubject<ComponentKind["Custom"][]>(
      creationArgs2.componentArr
    ),
    exFuncObsArr: createObservableArrayWithLifetime<ExFunc>(
      base.destroy$,
      creationArgs2.exFuncArr
    ),
    currentOrdinal$,
    rootExObjects$: rootExObjects.itemArr$,
    destroy$: new Subject<void>(),

    async addRootExObjectBlank() {
      const exObject = await ExObjectFactory2(ctx, {});
      rootExObjects.push(exObject);
    },

    async addCustomExFunc(exFunc: ExFunc) {
      this.exFuncObsArr.push(exFunc);
    },

    async getAndIncrementOrdinal(): Promise<number> {
      const ordinal = await firstValueFrom(currentOrdinal$);
      project.currentOrdinal$.next(ordinal + 1);
      return ordinal;
    },
  
    addComponentBlank: Effect.gen(function*(){
      const component = await ComponentFactory2.Custom(ctx, {});
      this.addComponent(ctx, project, component);
      return component;
    }),
  
    // async addComponent(
    //   _ctx: MainContext,
    //   project: Project,
    //   component: ComponentKind["Custom"]
    // ) {
    //   const componentL = await firstValueFrom(project.componentArr$);
    //   componentL.push(component);
    //   project.componentArr$.next(componentL);
    // },
  });
  return project;
}

export const Project = {
  async getAndIncrementOrdinal(project: Project): Promise<number> {
    const ordinal = await firstValueFrom(project.currentOrdinal$);
    project.currentOrdinal$.next(ordinal + 1);
    return ordinal;
  },

  async addComponentBlank(ctx: MainContext, project: Project) {
    const component = await ComponentFactory2.Custom(ctx, {});
    this.addComponent(ctx, project, component);
    return component;
  },

  async addComponent(
    _ctx: MainContext,
    project: Project,
    component: ComponentKind["Custom"]
  ) {
    const componentL = await firstValueFrom(project.componentArr$);
    componentL.push(component);
    project.componentArr$.next(componentL);
  },
};