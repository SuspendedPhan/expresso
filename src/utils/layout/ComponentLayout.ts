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
      (component) => this.getChildren(component, childrenByComponent),
      (component) => component.id,
      16,
      16
    );
  }

  static getChildren(component: Component, childrenByComponent: Map<Component, readonly Component[]>): readonly Component[] {
    return childrenByComponent.get(component) ?? [];
  }
}
