import { firstValueFrom, Subject } from "rxjs";
import {
  CanvasComponentStore,
  ComponentType,
  type CanvasComponent,
  type Component,
  type CustomComponent,
} from "src/ex-object/Component";
import { ExItemType, type ExItemBase } from "src/ex-object/ExItem";
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
  component: Component;
  children$: SUB<ExObject[]>;
  componentParameterProperties: ComponentParameterProperty[];
  basicProperties$: SUB<BasicProperty[]>;
  cloneCountProperty: CloneCountProperty;
}

export namespace MutateExObject {
  export async function addChildBlank(
    ctx: MainContext,
    exObject: ExObject
  ) {
    const child = await Create.ExObject.blank(ctx, CanvasComponentStore.circle);
    const children = await firstValueFrom(exObject.children$);
    const newChildren = [...children, child];
    exObject.children$.next(newChildren);
  }

  export async function addChild(
    exObject: ExObject,
    child: ExObject
  ) {
    const children = await firstValueFrom(exObject.children$);
    const newChildren = [...children, child];
    exObject.children$.next(newChildren);
  }
}

export namespace CreateExObject {
  export async function blank(
    ctx: MainContext,
    component: Component
  ): Promise<ExObject> {
    const id = `ex-object-${crypto.randomUUID()}`;
    const base = await ctx.objectFactory.createExItemBase(id);
    const componentProperties = await createComponentProperties(ctx, component);

    const object: ExObject = {
      ...base,
      itemType: ExItemType.ExObject,
      component,
      componentParameterProperties: componentProperties,
      basicProperties$: new Subject(),
      children$: createBehaviorSubjectWithLifetime<ExObject[]>(
        base.destroy$,
        []
      ),
      cloneCountProperty: await Create.Property.cloneCountBlank(ctx),
    };
    return object;
  }

  export async function from(
    ctx: MainContext,
    component: Component,
    id: string,
    componentProperties: ComponentParameterProperty[],
    basicProperties: BasicProperty[],
    cloneCountProperty: CloneCountProperty,
    children: ExObject[]
  ): Promise<ExObject> {
    const base = await ctx.objectFactory.createExItemBase(id);
    const object: ExObject = {
      ...base,
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
    return object;
  }
}

async function createComponentProperties(
  ctx: MainContext,
  component: Component
): Promise<ComponentParameterProperty[]> {
  switch (component.componentType) {
    case ComponentType.CanvasComponent:
      return createCanvasComponentProperties(ctx, component);
    case ComponentType.CustomComponent:
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
