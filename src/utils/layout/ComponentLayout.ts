import { map, Subject } from "rxjs";
import { Component } from "src/ex-object/ExObject";
import { OBS } from "../utils/Utils";
import { Layout, Node, Point } from "./Layout";

export interface ComponentViewLayoutInput {
  width$: OBS<number>;
  height$: OBS<number>;
}

export interface ComponentViewLayoutOutput {
  worldPosition$: OBS<Point>;
}

export type ComponentViewFactory = (
  output: ComponentViewLayoutOutput
) => ComponentViewLayoutInput;

export default class ComponentLayout {
  private layout = new Layout();

  private layoutInputByComponent = new Map<Component, ComponentViewLayoutInput>();

  public constructor(rootComponent: Component, private factory: ComponentViewFactory) {
    const worldPosition$ = new Subject<Point>();
    const input = factory({
      worldPosition$,
    });
    
    const node = this.layout.createRootNode({
      width$: input.width$,
      height$: input.height$,
      children$: this.getChildren$(rootComponent),
    });
    node.worldPosition.subscribe(worldPosition$);
  }

  public registerElement(component: Component, input: ComponentViewLayoutInput): void {

  }

  private getOrCreateLayoutInput(component: Component): ComponentViewLayoutInput {
    let input = this.layoutInputByComponent.get(component);
    if (!input) {
      input = {
        width$: new Subject<number>(),
        height$: new Subject<number>(),
      };
      this.layoutInputByComponent.set(component, input);
    }
    return input;
  }

  private createNode(component: Component): Node {
    const worldPosition$ = new Subject<Point>();
    const input = this.factory({
      worldPosition$,
    });

    const node = this.layout.createNode({
      children$: this.getChildren$(component),
      width$: input.width$,
      height$: input.height$,
    });
    node.worldPosition.subscribe(worldPosition$);
    return node;
  }

  private getChildren$(
    component: Component,
  ): OBS<readonly Node[]> {
    return component.children$.pipe(
      map((children) => {
        return children.map((child) => {
          const childNode = this.createNode(child);
          return childNode;
        });
      })
    );
  }
}
