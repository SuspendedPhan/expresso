import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import {
  CanvasComponentStore,
  ComponentKind,
  type CanvasComponent,
  type Component,
  type CustomComponent,
} from "src/ex-object/Component";
import { ExItemType, type ExItem, type ExItemBase, type Parent } from "src/ex-object/ExItem";
import type {
  BasicProperty,
  CloneCountProperty,
  ComponentParameterProperty,
} from "src/ex-object/Property";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  type SUB,
} from "src/utils/utils/Utils";

export interface ExObject extends ExItemBase {
  itemType: ExItemType.ExObject;
  name$: SUB<string>;
  component: Component;
  children$: SUB<ExObject[]>;
  componentParameterProperties: ComponentParameterProperty[];
  basicProperties$: SUB<BasicProperty[]>;
  cloneCountProperty: CloneCountProperty;
}

export namespace ExObjectFns {
  export async function addChildBlank(ctx: MainContext, exObject: ExObject) {
    const child = await CreateExObject.blank(ctx, {});
    addChild(exObject, child);
  }

  export async function addChild(exObject: ExObject, child: ExObject) {
    const children = await firstValueFrom(exObject.children$);
    child.parent$.next(exObject);
    const newChildren = [...children, child];
    exObject.children$.next(newChildren);
  }

  export async function addBasicPropertyBlank(
    ctx: MainContext,
    exObject: ExObject
  ) {
    const property = await Create.Property.basicBlank(ctx);
    property.parent$.next(exObject);
    const properties = await firstValueFrom(exObject.basicProperties$);
    const newProperties = [...properties, property];
    exObject.basicProperties$.next(newProperties);
  }

  export async function getExObject(exItem: ExItem): Promise<ExObject> {
    let item: ExItem | null = exItem;
    while (item !== null) {
      if (item.itemType === ExItemType.ExObject) {
        return item;
      }
      const parent: Parent = await firstValueFrom(item.parent$);
      item = parent;
    }
    throw new Error("ExObject not found");
  }

  export async function getRootExObject(exObject: ExObject): Promise<ExObject> {
    let parent: Parent = exObject;
    while (true) {
      const nextParent: Parent = await firstValueFrom(parent.parent$);
      if (nextParent === null) {
        assert(parent.itemType === ExItemType.ExObject);
        return parent;
      }
      parent = nextParent;
    }
  }

  export async function replaceExObject(
    ctx: MainContext,
    exObject: ExObject,
    newExObject: ExObject
  ) {
    const parent = await firstValueFrom(exObject.parent$);
    if (parent === null) {
      replaceRootExObject(ctx, exObject, newExObject);
      return;
    }

    assert(parent.itemType === ExItemType.ExObject);
    const children = await firstValueFrom(parent.children$);
    const index = children.indexOf(exObject);
    assert(index !== -1);
    newExObject.parent$.next(parent);
    children[index] = newExObject;
    parent.children$.next(children);
    
    exObject.destroy$.next();
  }

  async function replaceRootExObject(
    ctx: MainContext,
    exObject: ExObject,
    newExObject: ExObject,
  ) {
    const project = await firstValueFrom(ctx.projectCtx.currentProject$);
    const rootObjects = await firstValueFrom(project.rootExObjects$);
    const index = rootObjects.indexOf(exObject);
    assert(index !== -1);
    const newRootObjects = [...rootObjects];
    newRootObjects[index] = newExObject;
    project.rootExObjects$.next(newRootObjects);
    ctx.eventBus.rootExObjectAdded$.next(newExObject);

    exObject.destroy$.next();
  }
}

export namespace CreateExObject {

  export async function blank(
    ctx: MainContext,
    data: {
      id?: string;
      component?: Component;
      name?: string;
      componentProperties?: ComponentParameterProperty[];
      basicProperties?: BasicProperty[];
      cloneCountProperty?: CloneCountProperty;
      children?: ExObject[];
    },
  ): Promise<ExObject> {
    const ordinal = await ctx.projectCtx.getOrdinalProm();

    const id = data.id ?? `ex-object-${crypto.randomUUID()}`;
    const base = await ctx.objectFactory.createExItemBase(id);
    const component = data.component ?? CanvasComponentStore.circle;
    const name = data.name ?? `Object ${ordinal}`;
    const componentProperties = data.componentProperties ?? await createComponentProperties(ctx, component);
    const basicProperties = data.basicProperties ?? [];
    const cloneCountProperty = data.cloneCountProperty ?? await Create.Property.cloneCountBlank(ctx);
    const children = data.children ?? [];

    const object: ExObject = {
      ...base,
      name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
      itemType: ExItemType.ExObject,
      component,
      componentParameterProperties: componentProperties,
      basicProperties$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        basicProperties
      ),
      children$: createBehaviorSubjectWithLifetime<ExObject[]>(
        base.destroy$,
        children
      ),
      cloneCountProperty,
    };

    componentProperties.forEach((property) => {
      property.parent$.next(object);
    });
    basicProperties.forEach((property) => {
      property.parent$.next(object);
    });
    cloneCountProperty.parent$.next(object);
    ctx.eventBus.objectAdded$.next(object);
    return object;
  }
}

async function createComponentProperties(
  ctx: MainContext,
  component: Component
): Promise<ComponentParameterProperty[]> {
  switch (component.componentKind) {
    case ComponentKind.CanvasComponent:
      return createCanvasComponentProperties(ctx, component);
    case ComponentKind.CustomComponent:
      return createCustomComponentProperties(ctx, component);
  }
}
async function createCanvasComponentProperties(
  ctx: MainContext,
  component: CanvasComponent
): Promise<ComponentParameterProperty[]> {
  const parameter$Ps = component.parameters.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const parameters$P = await Promise.all(parameter$Ps);
  return parameters$P;
}

async function createCustomComponentProperties(
  ctx: MainContext,
  component: CustomComponent
): Promise<ComponentParameterProperty[]> {
  const parameterL = await firstValueFrom(component.parameters$);
  const propertyPL = parameterL.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const propertyLP = await Promise.all(propertyPL);
  return propertyLP;
}
