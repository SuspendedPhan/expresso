import { firstValueFrom, Subject } from "rxjs";
import {
  ComponentType,
  type Component,
  type CustomComponent,
  type SceneComponent,
} from "src/ex-object/Component";
import { ExItemType, type ExItemBase } from "src/ex-object/ExItem";
import {
  createComponentPropertyNew,
  type Property,
} from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  type SUB
} from "src/utils/utils/Utils";

export interface ExObject extends ExItemBase {
  itemType: ExItemType.ExObject;
  component: Component;
  children$: SUB<ExObject[]>;
  componentProperties: Property[];
  customProperties$: SUB<Property[]>;
  cloneCount$: SUB<number>;
}

export async function createExObjectNew(
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
    componentProperties,
    customProperties$: new Subject(),
    children$: createBehaviorSubjectWithLifetime<ExObject[]>(base.destroy$, []),
    cloneCount$: createBehaviorSubjectWithLifetime<number>(base.destroy$, 0),
  };
  return object;
}

async function createComponentProperties(
  ctx: MainContext,
  component: Component
): Promise<Property[]> {
  switch (component.componentType) {
    case ComponentType.SceneComponent:
      return createSceneComponentProperties(ctx, component);
    case ComponentType.CustomComponent:
      return createCustomComponentProperties(ctx, component);
  }
}
function createSceneComponentProperties(
  ctx: MainContext,
  component: SceneComponent
): Property[] {
  return component.parameters.map((input) => {
    return createComponentPropertyNew(ctx, input);
  });
}

async function createCustomComponentProperties(
  ctx: MainContext,
  component: CustomComponent
): Promise<Property[]> {
  return firstValueFrom(component.parameters$).then((inputs) => {
    return inputs.map((input) => {
      return createComponentPropertyNew(ctx, input);
    });
  });
}
