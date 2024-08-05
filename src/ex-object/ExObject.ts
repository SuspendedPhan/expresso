import { firstValueFrom, Subject } from "rxjs";
import {
  ComponentType,
  type CanvasComponent,
  type Component,
  type CustomComponent,
} from "src/ex-object/Component";
import { ExItemType, type ExItemBase } from "src/ex-object/ExItem";
import {
  type BasicProperty,
  type CloneCountProperty,
  type ComponentParameterProperty,
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

export namespace CreateExObject {
  export async function blank(
    ctx: MainContext,
    component: Component
  ): Promise<ExObject> {
    const id = `ex-object-${crypto.randomUUID()}`;
    const base = ctx.objectFactory.createExItemBase(id);
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
      cloneCountProperty: Create.Property.cloneCountBlank(ctx),
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
    const base = ctx.objectFactory.createExItemBase(id);
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
function createCanvasComponentProperties(
  ctx: MainContext,
  component: CanvasComponent
): ComponentParameterProperty[] {
  return component.parameters.map((input) => {
    return Create.Property.componentBlank(ctx, input);
  });
}

async function createCustomComponentProperties(
  ctx: MainContext,
  component: CustomComponent
): Promise<ComponentParameterProperty[]> {
  return firstValueFrom(component.parameters$).then((inputs) => {
    return inputs.map((input) => {
      return Create.Property.componentBlank(ctx, input);
    });
  });
}
