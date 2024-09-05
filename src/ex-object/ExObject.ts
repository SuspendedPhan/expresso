import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import {
  CanvasComponentStore,
  ComponentKind,
  type CanvasComponent,
  type Component,
  type CustomComponent,
} from "src/ex-object/Component";
import {
  ExItemType,
  type ExItem,
  type ExItemBase,
  type Parent,
} from "src/ex-object/ExItem";
import type { PropertyKind } from "src/ex-object/Property";
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
  componentParameterProperties: PropertyKind["ComponentParameterProperty"][];
  basicProperties$: SUB<PropertyKind["BasicProperty"][]>;
  cloneCountProperty: PropertyKind["CloneCountProperty"];
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

  export async function getExObject(exItem: ExItem): Promise<ExObject | null> {
    let item: ExItem | null = exItem;
    while (item !== null) {
      if ("itemType" in item && item.itemType === ExItemType.ExObject) {
        return item;
      }
      const parent: Parent = await firstValueFrom(item.parent$);
      item = parent;
    }
    return null;
  }

  export async function getRootExObject(exObject: ExObject): Promise<ExObject> {
    let parent: Parent = exObject;
    while (true) {
      const nextParent: Parent = await firstValueFrom(parent.parent$);
      if (nextParent === null) {
        assert("itemType" in parent && parent.itemType === ExItemType.ExObject);
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
    newExObject: ExObject
  ) {
    const project = await firstValueFrom(ctx.projectCtx.currentProject$);
    project.rootExObjectObsArr.replaceItem(exObject, newExObject);

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
      componentProperties?: PropertyKind["ComponentParameterProperty"][];
      basicProperties?: PropertyKind["BasicProperty"][];
      cloneCountProperty?: PropertyKind["CloneCountProperty"];
      children?: ExObject[];
    }
  ): Promise<ExObject> {
    let name = data.name;
    if (name === undefined) {
      const ordinal = await ctx.projectCtx.getOrdinalProm();
      name = `Object ${ordinal}`;
    }

    const id = data.id ?? `ex-object-${crypto.randomUUID()}`;
    const base = await ctx.objectFactory.createExItemBase(id);
    const component = data.component ?? CanvasComponentStore.circle;
    const componentProperties =
      data.componentProperties ??
      (await createComponentProperties(ctx, component));
    const basicProperties = data.basicProperties ?? [];
    const cloneCountProperty =
      data.cloneCountProperty ?? (await Create.Property.cloneCountBlank(ctx));
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
): Promise<PropertyKind["ComponentParameterProperty"][]> {
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
): Promise<PropertyKind["ComponentParameterProperty"][]> {
  const parameter$Ps = component.parameters.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const parameters$P = await Promise.all(parameter$Ps);
  return parameters$P;
}

async function createCustomComponentProperties(
  ctx: MainContext,
  component: CustomComponent
): Promise<PropertyKind["ComponentParameterProperty"][]> {
  const parameterL = await firstValueFrom(component.parameters$);
  const propertyPL = parameterL.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
  const propertyLP = await Promise.all(propertyPL);
  return propertyLP;
}
