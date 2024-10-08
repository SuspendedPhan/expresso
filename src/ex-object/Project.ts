// File: Project.ts

import assert from "assert-ts";
import { Effect, Stream } from "effect";
import {
  BehaviorSubject,
  firstValueFrom,
  shareReplay,
  Subject,
  switchMap,
} from "rxjs";
import { EventBusCtx } from "src/ctx/EventBusCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ComponentFactory2, type ComponentKind } from "src/ex-object/Component";
import { CustomExFuncFactory2, type CustomExFunc } from "src/ex-object/ExFunc";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory2 } from "src/ex-object/ExObject";
import { Expr } from "src/ex-object/Expr";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import type { Property } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  ObservableArray,
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
      getProperty(id: string): Property;

      /**
       * All ex objects, including root ex objects, their descendants, and any ex objects in components.
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
    const eventBusCtx = yield* EventBusCtx;

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
    const propertyById = new Map<string, Property>();

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

      getProperty(id: string): Property {
        const property = propertyById.get(id);
        assert(property !== undefined, `Property not found: ${id}`);
        return property;
      },

      exObjects: createObservableArrayWithLifetime<ExObject>(base.destroy$),
    });

    for (const exObject of rootExObjects.items) {
      log55.debug("Adding rootExObject", exObject.id);
      exObject.parent$.next(project);
    }

    for (const component of creationArgs2.components) {
      component.parent$.next(project);
    }

    yield* Effect.forkDaemon(
      Stream.runForEach(
        yield* eventBusCtx.propertyAddedForProject(project),
        (value) => {
          return Effect.gen(function* () {
            log55.debug("Adding property to project", value.id);
            propertyById.set(value.id, value);
          });
        }
      )
    );
    
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

  get activeProjectStream() {
    return Effect.gen(function* () {
      log55.debug("activeProjectStream");
      const activeProjects$ = yield* Project.activeProject$;
      return EffectUtils.obsToStream(activeProjects$);
    });
  },

  getExObjects: (project: Project) => {
    // For each root ex object, get all descendants
    return Effect.gen(function* () {
      log55.debug("getExObjects");
      const exObjects: ExObject[] = [];
      for (const rootExObject of project.rootExObjects.items) {
        exObjects.push(rootExObject);
        const descendants = yield* ExObject.Methods(rootExObject).descendants;
        exObjects.push(...descendants);
      }
      return exObjects;
    });
  },

  getProperties: (project: Project) => {
    return Effect.gen(function* () {
      log55.debug("getProperties");
      const properties: Property[] = [];
      for (const exObject of yield* Project.getExObjects(project)) {
        properties.push(...exObject.basicProperties.items);
        properties.push(exObject.cloneCountProperty);
        properties.push(...exObject.componentParameterProperties_.items);
      }
      return properties;
    });
  },

  getExprs: (project: Project) => {
    return Effect.gen(function* () {
      log55.debug("getExprs");
      const exprs: Expr[] = [];
      for (const property of yield* Project.getProperties(project)) {
        const expr = yield* property.expr.get;
        exprs.push(expr);
        const descendants = yield* Expr.descendants(expr);
        exprs.push(...descendants);
      }
      return exprs;
    });
  },

  Methods: (project: Project) => ({
    addRootExObjectBlank() {
      return Effect.gen(function* () {
        log55.debug("addRootExObjectBlank");
        const exObject = yield* ExObjectFactory2({});
        exObject.parent$.next(project);
        yield* project.rootExObjects.push(exObject);
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
        component.parent$.next(project);
        yield* project.components.push(component);
        return component;
      });
    },

    addExFuncBlank() {
      return Effect.gen(function* () {
        const exFunc = yield* CustomExFuncFactory2.Custom({});
        yield* project.exFuncs.push(exFunc);
        return exFunc;
      });
    },
  }),
};
