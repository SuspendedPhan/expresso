import { Component } from "src/ex-object/ExObject";
import { ElementLayout } from "./ElementLayout";
import MainContext from "src/main-context/MainContext";

export default class ComponentLayout {
  public static create(
    ctx: MainContext,
    rootComponent: Component
  ): ElementLayout {
    const childrenByComponent = new Map<Component, readonly Component[]>();
    ctx.eventBus.componentAdded$.subscribe((component) => {
      component.children$.subscribe((children) => {
        childrenByComponent.set(component, children);
      });
    });

    return new ElementLayout(
      () => rootComponent,
      (component) => childrenByComponent.get(component) ?? [],
      (component) => component.id,
      40,
      40
    );
  }
}
