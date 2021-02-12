import { Layout, Line, Point } from "@/code/Layout";
import { Root } from "./Root";
import * as rxjs from "rxjs";
import { share } from "rxjs/operators";
import { Observable, Subject } from "rxjs";

export class OrganismLayout {
  private layout = new Layout(
    this.getWidth.bind(this),
    this.getHeight.bind(this),
    this.getChildren.bind(this),
    this.getKey.bind(this)
  );

  public onLinesCalculated = new Observable<Line[]>(
    (subscriber) => (this.linesCalculatedSubscriber = subscriber)
  ).pipe(share());

  private onLocalPositionSubscriberByOrganismId = new Map<
    string,
    rxjs.Subscriber<Point>
  >();
  private organismElementById = new Map<string, HTMLElement>();
  private linesCalculatedSubscriber;

  constructor(private root: Root) {}

  public recalculate() {
    const output = this.layout.calculate(
      this.root.organismCollection.getRoot()
    );
    for (const [
      organismId,
      localPositionSubscriber,
    ] of this.onLocalPositionSubscriberByOrganismId.entries()) {
      localPositionSubscriber.next(output.localPositionsByKey.get(organismId));
    }

    console.assert(
      this.linesCalculatedSubscriber,
      "Failed assertion means nobody subscribed yet."
    );
    this.linesCalculatedSubscriber.next(output.lines);
  }

  public registerOrganismElement(organismElement, organismId) {
    this.organismElementById.set(organismId, organismElement);
  }

  public getLocalPositionObservable(organismId) {
    return new Observable<Point>((subscriber) => {
      this.onLocalPositionSubscriberByOrganismId.set(organismId, subscriber);
    });
  }

  private getWidth(organism) {
    const element = this.organismElementById.get(organism.id);
    return element?.clientWidth ?? 0;
  }

  private getHeight(organism) {
    const element = this.organismElementById.get(organism.id);
    return element?.clientHeight ?? 0;
  }

  private getKey(organism) {
    return organism.id;
  }

  private getChildren(organism) {
    return this.root.organismCollection.getChildren(organism);
  }
}
