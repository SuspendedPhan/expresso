import { map, Subject } from "rxjs";
import { OBS, SUB } from "../utils/Utils";
import { Layout, Node, Point } from "./Layout";

export interface ElementNode<T> {
  children$: OBS<readonly T[]>;
}

export interface LayoutInput {
  width$: OBS<number>;
  height$: OBS<number>;
}

interface LayoutInputSub {
  widthSub$: SUB<number>;
  heightSub$: SUB<number>;
}

export interface LayoutOutput {
  worldPosition$: OBS<Point>;
}

export default class ElementLayout<T extends ElementNode<T>> {
  private layout = new Layout();
  private layoutInputByObject = new Map<T, LayoutInputSub>();
  private layoutOutputByObject = new Map<T, LayoutOutput>();

  public constructor(rootObject: T) {
    this.createNode(rootObject, true);
  }

  public registerElement(object: T, input: LayoutInput): void {
    const layoutInput = this.getOrCreateLayoutInput(object);
    input.width$.subscribe(layoutInput.widthSub$);
    input.height$.subscribe(layoutInput.heightSub$);
  }

  public getOutput(object: T): LayoutOutput {
    return this.getOrCreateOutput(object);
  }

  private getOrCreateOutput(object: T): LayoutOutput {
    let layoutOutput = this.layoutOutputByObject.get(object);
    if (!layoutOutput) {
      layoutOutput = {
        worldPosition$: new Subject<Point>(),
      };
      this.layoutOutputByObject.set(object, layoutOutput);
    }

    return layoutOutput;
  }

  private getOrCreateLayoutInput(object: T): LayoutInputSub {
    let input = this.layoutInputByObject.get(object);
    if (!input) {
      input = {
        widthSub$: new Subject<number>(),
        heightSub$: new Subject<number>(),
      };
      this.layoutInputByObject.set(object, input);
    }
    return input;
  }

  private createNode(object: T, isRootNode: boolean): Node {
    const output = this.getOrCreateOutput(object);
    const layoutInput = this.getOrCreateLayoutInput(object);

    const nodeInput = {
      width$: layoutInput.widthSub$,
      height$: layoutInput.heightSub$,
      children$: this.getChildren$(object),
    };

    let node;
    if (isRootNode) {
      node = this.layout.createRootNode(nodeInput);
    } else {
      node = this.layout.createNode(nodeInput);
    }

    node.worldPosition.subscribe(output.worldPosition$ as SUB<Point>);
    return node;
  }

  private getChildren$(object: T): OBS<readonly Node[]> {
    return object.children$.pipe(
      map((children) => {
        return children.map((child) => {
          const childNode = this.createNode(child, false);
          return childNode;
        });
      })
    );
  }
}
