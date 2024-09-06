import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import { CanvasComponentStore, ComponentFactory, type Component, type ComponentKind } from "src/ex-object/Component";
import {
  type ExItem,
  type ExItemBase,
  type Parent,
} from "src/ex-object/ExItem";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import { fields, isType, matcher, variation } from "variant";

export const ExObjectFactory = variation("ExObject", fields<ExObject_>());
export type ExObject = ReturnType<typeof ExObjectFactory>;

interface ExObject_ extends ExItemBase {
  name$: SUB<string>;
  component: Component;
  children$: SUB<ExObject[]>;
  componentParameterProperties: PropertyKind["ComponentParameterProperty"][];
  basicProperties$: SUB<PropertyKind["BasicProperty"][]>;
  cloneCountProperty: PropertyKind["CloneCountProperty"];
}

interface ExObjectCreationArgs {
  id?: string;
  component?: Component;
  name?: string;
  componentProperties?: PropertyKind["ComponentParameterProperty"][];
  basicProperties?: PropertyKind["BasicProperty"][];
  cloneCountProperty?: PropertyKind["CloneCountProperty"];
  children?: ExObject[];
}
export async function ExObjectFactory2(ctx: MainContext, creationArgs: ExObjectCreationArgs) {
  const component = creationArgs.component ?? CanvasComponentStore.circle;

  const creationArgs2: Required<ExObjectCreationArgs> = {
    id: creationArgs.id ?? Utils.createId("ex-object"),
    component,
    name: creationArgs.name ?? `Object ${await ctx.projectCtx.getOrdinalProm()}`,
    componentProperties: creationArgs.componentProperties ?? await createComponentProperties(ctx, component),
    basicProperties: creationArgs.basicProperties ?? [],
    cloneCountProperty: creationArgs.cloneCountProperty ?? await PropertyFactory2.CloneCountProperty(ctx, {}),
    children: creationArgs.children ?? [],
  };

  const base = await ctx.objectFactory.createExItemBase(creationArgs2.id);
  const exObject = ExObjectFactory({
    ...base,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.name),
    component: creationArgs2.component,
    componentParameterProperties: creationArgs2.componentProperties,
    basicProperties$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.basicProperties),
    children$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.children),
    cloneCountProperty: creationArgs2.cloneCountProperty,
  });
  
  creationArgs2.componentProperties.forEach((property) => {
    property.parent$.next(exObject);
  });

  creationArgs2.basicProperties.forEach((property) => {
    property.parent$.next(exObject);
  });

  creationArgs2.cloneCountProperty.parent$.next(exObject);

  ctx.eventBus.objectAdded$.next(exObject);
  return exObject;
}

export const ExObject = {
  async addChildBlank(ctx: MainContext, exObject: ExObject) {
    const child = await ExObjectFactory2(ctx, {});
    ExObject.addChild(exObject, child);
  },

  async addChild(exObject: ExObject, child: ExObject) {
    const children = await firstValueFrom(exObject.children$);
    child.parent$.next(exObject);
    const newChildren = [...children, child];
    exObject.children$.next(newChildren);
  },

  async addBasicPropertyBlank(
    ctx: MainContext,
    exObject: ExObject
  ) {
    const property = await Create.Property.basicBlank(ctx);
    property.parent$.next(exObject);
    const properties = await firstValueFrom(exObject.basicProperties$);
    const newProperties = [...properties, property];
    exObject.basicProperties$.next(newProperties);
  },

  async getExObject(exItem: ExItem): Promise<ExObject | null> {
    let item: ExItem | null = exItem;
    while (item !== null) {
      if (isType(item, ExObjectFactory)) {
        return item;
      }
      const parent: Parent = await firstValueFrom(item.parent$);
      item = parent;
    }
    return null;
  },

  async getRootExObject(exObject: ExObject): Promise<ExObject> {
    let parent: Parent = exObject;
    while (true) {
      const nextParent: Parent = await firstValueFrom(parent.parent$);
      if (nextParent === null) {
        assert(isType(parent, ExObjectFactory));
        return parent;
      }
      parent = nextParent;
    }
  },

  async replaceExObject(
    ctx: MainContext,
    exObject: ExObject,
    newExObject: ExObject
  ) {
    const parent = await firstValueFrom(exObject.parent$);
    if (parent === null) {
      ExObject.replaceRootExObject(ctx, exObject, newExObject);
      return;
    }

    assert(isType(parent, ExObjectFactory));
    const children = await firstValueFrom(parent.children$);
    const index = children.indexOf(exObject);
    assert(index !== -1);
    newExObject.parent$.next(parent);
    children[index] = newExObject;
    parent.children$.next(children);

    exObject.destroy$.next();
  },

  async replaceRootExObject(
    ctx: MainContext,
    exObject: ExObject,
    newExObject: ExObject
  ) {
    const project = await firstValueFrom(ctx.projectCtx.currentProject$);
    project.rootExObjectObsArr.replaceItem(exObject, newExObject);

    exObject.destroy$.next();
  }
}

async function createComponentProperties(
  ctx: MainContext,
  component: Component
): Promise<PropertyKind["ComponentParameterProperty"][]> {
  return matcher(component)
    .when(ComponentFactory.CanvasComponent, async (component) => {
      return createCanvasComponentProperties(ctx, component);
    })
    .when(ComponentFactory.CustomComponent, async (component) => {
      return createCustomComponentProperties(ctx, component);
    })
    .complete();
}

async function createCanvasComponentProperties(
  ctx: MainContext,
  component: ComponentKind["CanvasComponent"]
): Promise<PropertyKind["ComponentParameterProperty"][]> {
  const parameter$Ps = component.parameters.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const parameters$P = await Promise.all(parameter$Ps);
  return parameters$P;
}

async function createCustomComponentProperties(
  ctx: MainContext,
  component: ComponentKind["CustomComponent"]
): Promise<PropertyKind["ComponentParameterProperty"][]> {
  const parameterL = await firstValueFrom(component.parameters$);
  const propertyPL = parameterL.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const propertyLP = await Promise.all(propertyPL);
  return propertyLP;
}
