import assert from "assert-ts";
import { Effect, Stream } from "effect";
import {
  CanvasComponentStore,
  ComponentFactory,
  type Component,
  type ComponentKind,
} from "src/ex-object/Component";
import { ExItem, type ExItemBase, type Parent } from "src/ex-object/ExItem";
import { Project } from "src/ex-object/Project";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  type ArrayEvent,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";
import { fields, isType, matcher, variation } from "variant";

const log55 = log5("ExObject.ts");
interface ExObject_ extends ExItemBase {
  name$: SUB<string>;
  component: Component;
  children: ObservableArray<ExObject>;
  children$: OBS<ExObject[]>;
  componentParameterProperties_: ObservableArray<
    PropertyKind["ComponentParameterProperty"]
  >;
  get componentParameterProperties(): PropertyKind["ComponentParameterProperty"][];
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
    log55.debug("ExObjectFactory2.start");
    const component = creationArgs.component ?? CanvasComponentStore.circle;

    log55.debug("ExObjectFactory2.component", component);

    const creationArgs2: Required<ExObjectCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("ex-object"),
      component,
      name:
        creationArgs.name ??
        `Object ${yield* Project.Methods(
          yield* Project.activeProject
        ).getAndIncrementOrdinal()}`,
      componentProperties:
        creationArgs.componentProperties ??
        (yield* createComponentProperties(component)),
      basicProperties: creationArgs.basicProperties ?? [],
      cloneCountProperty:
        creationArgs.cloneCountProperty ??
        (yield* PropertyFactory2.CloneCountProperty({})),
      children: creationArgs.children ?? [],
    };

    log55.debug("ExObjectFactory2.creationArgs2", creationArgs2);

    const base = yield* ExItem.createExItemBase(creationArgs2.id);

    const componentParameterProperties_ = createObservableArrayWithLifetime(
      base.destroy$,
      creationArgs2.componentProperties
    );

    const children = createObservableArrayWithLifetime(
      base.destroy$,
      creationArgs2.children
    );
    const exObject = ExObjectFactory({
      ...base,
      name$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.name
      ),
      component: creationArgs2.component,
      componentParameterProperties_,
      get componentParameterProperties() {
        return componentParameterProperties_.items;
      },
      basicProperties: createObservableArrayWithLifetime(
        base.destroy$,
        creationArgs2.basicProperties
      ),
      children,
      children$: children.items$,
      cloneCountProperty: creationArgs2.cloneCountProperty,
    });

    creationArgs2.componentProperties.forEach((property) => {
      property.parent$.next(exObject);
    });

    creationArgs2.basicProperties.forEach((property) => {
      property.parent$.next(exObject);
    });

    creationArgs2.cloneCountProperty.parent$.next(exObject);
    return exObject;
  });
}

export const ExObject = {
  Methods: (exObject: ExObject) => ({
    addChildBlank() {
      return Effect.gen(this, function* () {
        log55.debug("addChildBlank");
        const child = yield* ExObjectFactory2({});
        yield* this.addChild(child);
      });
    },

    addChild(child: ExObject) {
      return Effect.gen(function* () {
        child.parent$.next(exObject);
        yield* exObject.children.push(child);
      });
    },

    addBasicPropertyBlank() {
      return Effect.gen(function* () {
        const property = yield* PropertyFactory2.BasicProperty({});
        property.parent$.next(exObject);
        yield* exObject.basicProperties.push(property);
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
        yield* parent.children.replaceItem(exObject, newExObject);
        exObject.destroy$.next();
      });
    },

    replaceRootExObject(newExObject: ExObject) {
      return Effect.gen(function* () {
        const project = yield* Project.activeProject;
        yield* project.rootExObjects.replaceItem(exObject, newExObject);
        exObject.destroy$.next();
      });
    },

    get properties() {
      return (function* () {
        const basicProperties = exObject.basicProperties.items;
        yield exObject.cloneCountProperty;
        for (const property of exObject.componentParameterProperties) {
          yield property;
        }
        for (const property of basicProperties) {
          yield property;
        }
      })();
    },

    get descendants(): Effect.Effect<ExObject[], never, never> {
      return Effect.gen(function* () {
        const result = new Array<ExObject>();
        const children = yield* EffectUtils.firstValueFrom(exObject.children$);
        for (const child of children) {
          result.push(child);
          const descendants = yield* ExObject.Methods(child).descendants;
          result.push(...descendants);
        }
        return result;
      });
    },

    get descendants2(): Effect.Effect<Stream.Stream<ArrayEvent<ExObject>>> {
      /*
      for each child array event:
        if add:
          emit the event in the result stream

      for each descendant array event:
        if add:
          emit the event in the result stream
      */

      return Effect.gen(function* () {
        const childEvents = yield* exObject.children.events;

        const descendantsForChildren = Stream.flatMap(
          exObject.children.itemStream,
          (children: ExObject[]) => {
            return ExObject.descendantsForExObjects(children);
          },
          { switch: true }
        );

        const result = Stream.merge(childEvents, descendantsForChildren);
        return result;
      });
    },
  }),

  descendantsForExObjects(
    exObjects: ExObject[]
  ): Stream.Stream<ArrayEvent<ExObject>> {
    const vv = exObjects.map((exObject) => {
      return Stream.unwrap(ExObject.Methods(exObject).descendants2);
    });
    const vv2 = Stream.mergeAll(vv, { concurrency: "unbounded" });
    return vv2;
  },
};

// ----------------
// Private functions
// ----------------

function createComponentProperties(component: Component) {
  return Effect.gen(function* () {
    return yield* matcher(component)
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
    const parameters = component.parameters.map((parameter) => {
      return PropertyFactory2.ComponentParameterProperty({ parameter });
    });
    return yield* Effect.all(parameters);
  });
}

function createCustomComponentProperties(component: ComponentKind["Custom"]) {
  return Effect.gen(function* () {
    const properties = component.parameters.items.map((parameter) => {
      return PropertyFactory2.ComponentParameterProperty({
        parameter,
      });
    });
    return yield* Effect.all(properties);
  });
}
