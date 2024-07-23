import { map, ReplaySubject, Subject } from "rxjs";
import { OBS, SUB } from "../utils/Utils";
import { Layout, Node, Point } from "./Layout";
import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export interface ElementNode<T> {
  id: string;
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

  @loggedMethod
  public getOutput(object: T): LayoutOutput {
    const logger = Logger.logger();
    const output = this.getOrCreateOutput(object);
    logger.log("output", this.layoutOutputByObject);
    return output;
  }

  @loggedMethod
  private getOrCreateOutput(object: T): LayoutOutput {
    Logger.logFunction();
    Logger.arg("object", object.id);
    const logger = Logger.logger();
    let output = this.layoutOutputByObject.get(object);
    if (!output) {
      logger.log("creating output", object.id);
      output = {
        worldPosition$: new Subject<Point>(),
      };
      this.layoutOutputByObject.set(object, output);
    }

    output.worldPosition$.subscribe((position) => {
      logger.log("object id", object.id);
      logger.log("position", position);
    });
    return output;
  }

  private getOrCreateLayoutInput(object: T): LayoutInputSub {
    let input = this.layoutInputByObject.get(object);
    if (!input) {
      input = {
        widthSub$: new ReplaySubject<number>(1),
        heightSub$: new ReplaySubject<number>(1),
      };
      this.layoutInputByObject.set(object, input);
    }
    return input;
  }

  @loggedMethod
  private createNode(object: T, isRootNode: boolean): Node {
    const logger = Logger.logger();
    logger.log("object", object.id);
    logger.log("isRootNode", isRootNode);

    const layoutInput = this.getOrCreateLayoutInput(object);
    layoutInput.widthSub$.subscribe((width) => {
      logger.log("object", object.id);
      logger.log("width", width);
    });

    const nodeInput = {
      id: object.id,
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

    const output = this.getOrCreateOutput(object);
    node.worldPosition.subscribe((position) => {
      logger.log("position, object id", object.id);
      logger.log("position", position);
      (output.worldPosition$ as SUB<Point>).next(position);
    });
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
