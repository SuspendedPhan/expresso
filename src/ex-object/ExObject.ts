import { first, map, of, Subject, type Observable } from "rxjs";
import {
  ComponentType,
  type Component,
  type CustomComponent,
  type SceneComponent
} from "src/ex-object/Component";
import {
  createComponentPropertyNew,
  type Property,
} from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import type { OBS, SUB } from "src/utils/utils/Utils";

export interface ExObject {
  component: Component;
  componentProperties: Property[];
  customPropertiesSub$: SUB<Property[]>;
}

export function createExObjectNew$(ctx: MainContext, component: Component): OBS<ExObject> {
  return createProperties$(ctx, component).pipe(
    map((componentProperties) => {
      const object: ExObject = {
        component,
        componentProperties,
        customPropertiesSub$: new Subject(),
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
  return component.inputSub$.pipe(
    first(),
    map((inputs) =>
      inputs.map((input) => createComponentPropertyNew(ctx, input))
    )
  );
}
