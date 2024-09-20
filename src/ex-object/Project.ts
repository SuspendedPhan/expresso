import { Effect } from "effect";
import {
  BehaviorSubject,
  firstValueFrom,
  shareReplay,
  Subject,
  switchMap,
} from "rxjs";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ComponentFactory2, type ComponentKind } from "src/ex-object/Component";
import { CustomExFuncFactory2, type CustomExFunc } from "src/ex-object/ExFunc";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObjectFactory2, type ExObject } from "src/ex-object/ExObject";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import { Utils, type OBS } from "src/utils/utils/Utils";
import { fields, variation } from "variant";

const log55 = log5("Project.ts");

export const ProjectFactory = variation(
  "Project",
  fields<
    {
      libraryProject: LibraryProject | null;
      rootExObjects: ObservableArray<ExObject>;
      components: ObservableArray<ComponentKind["Custom"]>;
      exFuncs: ObservableArray<CustomExFunc>;
      currentOrdinal$: BehaviorSubject<number>;
      destroy$: Subject<void>;

      /**
       * All ExObjects in the project.
       */
      exObjects: ObservableArray<ExObject>;
    } & ExItemBase
  >()
);

export type Project = ReturnType<typeof ProjectFactory>;

interface ProjectCreationArgs {
  id?: string;
  rootExObjects?: ExObject[];
  components?: ComponentKind["Custom"][];
  exFuncs?: CustomExFunc[];
  currentOrdinal?: number;
}

export function ProjectFactory2(creationArgs: ProjectCreationArgs) {
  return Effect.gen(function* () {
    const currentOrdinal = creationArgs.currentOrdinal ?? 0;
    const creationArgs2: Required<ProjectCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("project"),
      rootExObjects: creationArgs.rootExObjects ?? [],
      components: creationArgs.components ?? [],
      exFuncs: creationArgs.exFuncs ?? [],
      currentOrdinal: creationArgs.currentOrdinal ?? 0,
    };

    const base = yield* ExItem.createExItemBase(creationArgs2.id);

    const rootExObjects = createObservableArrayWithLifetime<ExObject>(
      base.destroy$,
      creationArgs2.rootExObjects
    );

    const currentOrdinal$ = new BehaviorSubject<number>(currentOrdinal);

    const project = ProjectFactory({
      ...base,
      libraryProject: null,
      rootExObjects: rootExObjects,
      components: createObservableArrayWithLifetime<ComponentKind["Custom"]>(
        base.destroy$,
        creationArgs2.components
      ),
      exFuncs: createObservableArrayWithLifetime<CustomExFunc>(
        base.destroy$,
        creationArgs2.exFuncs
      ),
      currentOrdinal$,
      destroy$: new Subject<void>(),
      exObjects: createObservableArrayWithLifetime<ExObject>(base.destroy$),
    });
    return project;
  });
}

export const Project = {
  get activeProject$() {
    return Effect.gen(function* () {
      log55.debug("activeProject$");
      const libraryProjectCtx = yield* LibraryProjectCtx;
      const activeLibraryProject$ = libraryProjectCtx.activeLibraryProject$;
      const result = activeLibraryProject$.pipe(
        switchMap((libraryProject) => {
          const project$: OBS<Project> = libraryProject.project$;
          return project$;
        }),
        log55.tapDebug("activeProject$.switchMap"),
        shareReplay(1)
      );
      return result;
    });
  },

  get activeProject(): Effect.Effect<Project, never, LibraryProjectCtx> {
    const effect = Effect.gen(function* () {
      log55.debug("activeProject");
      const activeProjects$ = yield* Project.activeProject$;
      const project: Project = yield* Effect.promise(() =>
        firstValueFrom(activeProjects$)
      );
      return project;
    });
    return effect;
  },

  Methods: (project: Project) => ({
    addRootExObjectBlank() {
      return Effect.gen(function* () {
        log55.debug("addRootExObjectBlank");
        const exObject = yield* ExObjectFactory2({});
        project.rootExObjects.push(exObject);
        project.exObjects.push(exObject);
      });
    },

    getAndIncrementOrdinal() {
      return Effect.gen(function* () {
        const ordinal = yield* EffectUtils.firstValueFrom(
          project.currentOrdinal$
        );
        project.currentOrdinal$.next(ordinal + 1);
        return ordinal;
      });
    },

    addComponentBlank() {
      return Effect.gen(function* () {
        const component = yield* ComponentFactory2.Custom({});
        project.components.push(component);
        return component;
      });
    },

    addExFuncBlank() {
      return Effect.gen(function* () {
        const exFunc = yield* CustomExFuncFactory2.Custom({});
        project.exFuncs.push(exFunc);
        return exFunc;
      });
    },
  }),
};
