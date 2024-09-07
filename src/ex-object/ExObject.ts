import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { ProjectCtx } from "src/ctx/ProjectCtx";
import {
  CanvasComponentStore,
  ComponentFactory,
  type Component,
  type ComponentKind,
} from "src/ex-object/Component";
import { ExItem, type ExItemBase, type Parent } from "src/ex-object/ExItem";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import { fields, isType, matcher, variation } from "variant";
interface ExObject_ extends ExItemBase {
  name$: SUB<string>;
  component: Component;
  children$: SUB<ExObject[]>;
  componentParameterProperties: PropertyKind["ComponentParameterProperty"][];
  basicProperties: ObservableArray<PropertyKind["BasicProperty"]>;
  cloneCountProperty: PropertyKind["CloneCountProperty"];
}

export const ExObjectFactory = variation("ExObject", fields<ExObject_>());
export type ExObject = ReturnType<typeof ExObjectFactory>;

interface ExObjectCreationArgs {
  id?: string;
  component?: Component;
  name?: string;
  componentProperties?: PropertyKind["ComponentParameterProperty"][];
  basicProperties?: PropertyKind["BasicProperty"][];
  cloneCountProperty?: PropertyKind["CloneCountProperty"];
  children?: ExObject[];
}

export function ExObjectFactory2(creationArgs: ExObjectCreationArgs) {
  return Effect.gen(function* () {
    const projectCtx = yield* ProjectCtx;
    const project = yield* projectCtx.activeProject;
    const component = creationArgs.component ?? CanvasComponentStore.circle;

    const creationArgs2: Required<ExObjectCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("ex-object"),
      component,
      name:
        creationArgs.name ??
        `Object ${yield* project.getAndIncrementOrdinal()}`,
      componentProperties:
        creationArgs.componentProperties ??
        (yield* createComponentProperties(component)),
      basicProperties: creationArgs.basicProperties ?? [],
      cloneCountProperty:
        creationArgs.cloneCountProperty ??
        (yield* PropertyFactory2.CloneCountProperty({})),
      children: creationArgs.children ?? [],
    };

    const base = yield* ExItem.createExItemBase(creationArgs2.id);
    const exObject = ExObjectFactory({
      ...base,
      name$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.name
      ),
      component: creationArgs2.component,
      componentParameterProperties: creationArgs2.componentProperties,
      basicProperties: createObservableArrayWithLifetime(
        base.destroy$,
        creationArgs2.basicProperties
      ),
      children$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.children
      ),
      cloneCountProperty: creationArgs2.cloneCountProperty,
    });

    creationArgs2.componentProperties.forEach((property) => {
      property.parent$.next(exObject);
    });

    creationArgs2.basicProperties.forEach((property) => {
      property.parent$.next(exObject);
    });

    creationArgs2.cloneCountProperty.parent$.next(exObject);

    project.exObjects.push(exObject);
    return exObject;
  });
}

export function ExObjectMethods(exObject: ExObject) {
  return {
    addChildBlank() {
      return Effect.gen(this, function* () {
        const child = yield* ExObjectFactory2({});
        this.addChild(child);
      });
    },

    addChild(child: ExObject) {
      return Effect.gen(function* () {
        const children = yield* EffectUtils.firstValueFrom(exObject.children$);
        child.parent$.next(exObject);
        const newChildren = [...children, child];
        exObject.children$.next(newChildren);
      });
    },

    addBasicPropertyBlank() {
      return Effect.gen(function* () {
        const property = yield* PropertyFactory2.BasicProperty({});
        property.parent$.next(exObject);
        exObject.basicProperties.push(property);
      });
    },

    getExObject(exItem: ExItem) {
      return Effect.gen(function* () {
        let item: ExItem | null = exItem;
        while (item !== null) {
          if (isType(item, ExObjectFactory)) {
            return item;
          }
          const parent: Parent = yield* EffectUtils.firstValueFrom(
            item.parent$
          );
          item = parent;
        }
        return null;
      });
    },

    getRootExObject() {
      return Effect.gen(function* () {
        let parent: Parent = exObject;
        while (true) {
          const nextParent: Parent = yield* EffectUtils.firstValueFrom(
            parent.parent$
          );
          if (nextParent === null) {
            assert(isType(parent, ExObjectFactory));
            return parent;
          }
          parent = nextParent;
        }
      });
    },

    replaceExObject(newExObject: ExObject) {
      return Effect.gen(this, function* () {
        const parent = yield* EffectUtils.firstValueFrom(exObject.parent$);
        if (parent === null) {
          this.replaceRootExObject(newExObject);
          return;
        }
        assert(isType(parent, ExObjectFactory));
        const children = yield* EffectUtils.firstValueFrom(parent.children$);
        const index = children.indexOf(exObject);
        assert(index !== -1);
        newExObject.parent$.next(parent);
        children[index] = newExObject;
        parent.children$.next(children);
        exObject.destroy$.next();
      });
    },

    replaceRootExObject(newExObject: ExObject) {
      return Effect.gen(function* () {
        const projectCtx = yield* ProjectCtx;
        const project = yield* projectCtx.activeProject;
        project.rootExObjects.replaceItem(exObject, newExObject);
        exObject.destroy$.next();
      });
    },
  };
}

// ----------------
// Private functions
// ----------------

function createComponentProperties(component: Component) {
  return Effect.gen(function* () {
    return matcher(component)
      .when(ComponentFactory.Canvas, (component) => {
        return createCanvasComponentProperties(component);
      })
      .when(ComponentFactory.Custom, (component) => {
        return createCustomComponentProperties(component);
      })
      .complete();
  });
}

function createCanvasComponentProperties(component: ComponentKind["Canvas"]) {
  return Effect.gen(function* () {
    const parameter$Ps = component.parameters.map((input) => {
      return PropertyFactory2.ComponentParameterProperty(input);
    });
    const parameters$P = await Promise.all(parameter$Ps);
    return parameters$P;
  });
}

function createCustomComponentProperties(
  ctx: MainContext,
  component: ComponentKind["Custom"]
) {
  return Effect.gen(function* () {
    const parameters = yield* EffectUtils.firstValueFrom(component.parameters$);
    const properties = parameters.map((input) => {
      return PropertyFactory2.ComponentParameterProperty(input);
    });
    const propertyLP = yield* EffectUtils.Promise.all(properties);
    return propertyLP;
  });
}
