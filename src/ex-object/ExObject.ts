import { first, map, of, Subject, type Observable } from "rxjs";
import {
  ComponentType,
  type Component,
  type CustomComponent,
  type SceneComponent
} from "src/ex-object/Component";
import { ExItemType, type ExItemBase } from "src/ex-object/ExItem";
import {
  createComponentPropertyNew,
  type Property
} from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { createBehaviorSubjectWithLifetime, type OBS, type SUB } from "src/utils/utils/Utils";

export interface ExObject extends ExItemBase {
  itemType: ExItemType.ExObject;
  component: Component;
  children$: SUB<ExObject[]>;
  componentProperties: Property[];
  customProperties$: SUB<Property[]>;
  cloneCount$: SUB<number>;
}

export function createExObjectNew$(ctx: MainContext, component: Component): OBS<ExObject> {
  return createProperties$(ctx, component).pipe(
    map((componentProperties) => {
      const id = `ex-object-${crypto.randomUUID()}`;
      const base = ctx.objectFactory.createExItemBase(id);
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
    })
  );
}

function createProperties$(
  ctx: MainContext,
  component: Component
): OBS<Property[]> {
  switch (component.componentType) {
    case ComponentType.SceneComponent:
      return createSceneComponentProperties$(ctx, component);
    case ComponentType.CustomComponent:
      return createCustomComponentProperties$(ctx, component);
  }
}
function createSceneComponentProperties$(
  ctx: MainContext,
  component: SceneComponent
): OBS<Property[]> {
  return of(
    component.inputs.map((input) => {
      return createComponentPropertyNew(ctx, input);
    })
  );
}

function createCustomComponentProperties$(
  ctx: MainContext,
  component: CustomComponent
): Observable<Property[]> {
  return component.inputs$.pipe(
    first(),
    map((inputs) =>
      inputs.map((input) => createComponentPropertyNew(ctx, input))
    )
  );
}
