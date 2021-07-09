import {Layout, Line, Output, Point} from "@/code/Layout";
import { Root } from "../store/Root";
import * as rxjs from "rxjs";
import { share } from "rxjs/operators";
import { Observable, Subject } from "rxjs";

export class ElementLayout {
  private layout;

  private getRootNode;

  public onCalculated = new Observable<Output>(
    (subscriber) => (this.onCalculatedSubscriber = subscriber)
  ).pipe(share());


  private onCalculatedSubscriber;

  private onLocalPositionSubscriberByElementId = new Map<
    string,
    rxjs.Subscriber<Point>
  >();
  private elementByKey = new Map<string, HTMLElement>();

  private getKey;

  constructor(getRootNode, getChildren, getKey: any = null) {
    this.getKey = getKey ?? (node => node.id);

    this.layout = new Layout(
        this.getWidth.bind(this),
        this.getHeight.bind(this),
        getChildren,
        this.getKey
    );
    this.getRootNode = getRootNode;
  }

  public recalculate() {
    const rootNode = this.getRootNode();
    const output = this.layout.calculate(rootNode);
    for (const [
      elementKey,
      localPositionSubscriber,
    ] of this.onLocalPositionSubscriberByElementId.entries()) {
      localPositionSubscriber.next(output.localPositionsByKey.get(elementKey));
    }

    console.assert(
      this.onCalculatedSubscriber,
      "Failed assertion means nobody subscribed yet."
    );
    this.onCalculatedSubscriber.next(output);
  }

  public registerElement(element, elementKey) {
    this.elementByKey.set(elementKey, element);
  }

  public getLocalPositionObservable(elementKey) {
    return new Observable<Point>((subscriber) => {
      this.onLocalPositionSubscriberByElementId.set(elementKey, subscriber);
    });
  }

  private getWidth(node) {
    const key = this.getKey(node);
    const element = this.elementByKey.get(key);
    return element?.clientWidth ?? 0;
  }

  private getHeight(node) {
    const key = this.getKey(node);
    const element = this.elementByKey.get(key);
    return element?.clientHeight ?? 0;
  }
}
