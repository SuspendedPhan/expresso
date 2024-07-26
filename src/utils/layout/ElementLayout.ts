import * as rxjs from "rxjs";
import { Observable } from "rxjs";
import { share } from "rxjs/operators";
import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";
import type { Point } from "./Layout";
import { type Output, Layout } from "./Layout";

export class ElementLayout {
  private layout;

  private getRootNode;

  // onCalculated is a useful event for redrawing the connecting lines and resizing the container.
  public onCalculated = new Observable<Output>(
    (subscriber) => (this.onCalculatedSubscriber = subscriber)
  ).pipe(share());

  private onCalculatedSubscriber: any;

  private onLocalPositionSubscriberByElementId = new Map<
    string,
    rxjs.Subscriber<Point>
  >();
  private elementByKey = new Map<string, HTMLElement>();

  private getKey;

  // getRootNode is not used.
  // getChildren refers to the children that we will call getKey() on.
  constructor(
    getRootNode: () => any,
    getChildren: (node: any) => readonly any[],
    getKey: ((node: any) => string) | null = null,
    horizontalMargin: number,
    verticalMargin: number
  ) {
    this.getKey = getKey ?? ((node) => node.id);

    this.layout = new Layout(
      this.getWidth.bind(this),
      this.getHeight.bind(this),
      getChildren,
      this.getKey,
      horizontalMargin,
      verticalMargin
    );
    this.getRootNode = getRootNode;
  }

  @loggedMethod
  public recalculate() {
    const logger = Logger.logger();

    const rootNode = this.getRootNode();
    const output = this.layout.calculate(rootNode);
    
    for (const [
      elementKey,
      localPositionSubscriber,
    ] of this.onLocalPositionSubscriberByElementId.entries()) {
      localPositionSubscriber.next(output.localPositionsByKey.get(elementKey));
    }

    logger.log("output", JSON.stringify(output));
    logger.log("localPositionsByKey", JSON.stringify(Array.from(output.localPositionsByKey.entries())));

    console.assert(
      this.onCalculatedSubscriber,
      "Failed assertion means nobody subscribed yet."
    );
    this.onCalculatedSubscriber.next(output);
  }

  // registerElement must be called so that the layout knows how to get the width and height of your elements.
  public registerElement(element: any, elementKey: string) {
    this.elementByKey.set(elementKey, element);
  }

  // getLocalPositionObservable is a useful event for positioning each individual element. Note that these are local
  // positions, which means children are positioned relative to the parent. This works well with nested elements that
  // all have the "position: absolute" CSS rule.
  // When the event is fired, a Layout.Point object is passed.
  public getLocalPositionObservable(elementKey: string): Observable<Point> {
    return new Observable<Point>((subscriber) => {
      this.onLocalPositionSubscriberByElementId.set(elementKey, subscriber);
    });
  }

  private getWidth(node: any) {
    const key = this.getKey(node);
    const element = this.elementByKey.get(key);
    return element?.offsetWidth ?? 0;
  }

  private getHeight(node: any) {
    const key = this.getKey(node);
    const element = this.elementByKey.get(key);
    const answer = element?.offsetHeight ?? 0;
    return answer;
  }
}
