import { Layout, type Output, type Point } from '@/code/Layout'
import * as rxjs from 'rxjs'
import { share } from 'rxjs/operators'
import { Observable, Subject } from 'rxjs'

export class ElementLayout {
  private layout

  private getRootNode

  // onCalculated is a useful event for redrawing the connecting lines and resizing the container.
  public onCalculated = new Observable<Output>(
    (subscriber) => (this.onCalculatedSubscriber = subscriber)
  ).pipe(share())

  private onCalculatedSubscriber

  private onLocalPositionSubscriberByElementId = new Map<string, rxjs.Subscriber<Point>>()
  private elementByKey = new Map<string, HTMLElement>()

  private getKey

  // getRootNode is not used.
  // getChildren refers to the children that we will call getKey() on.
  constructor(
    getRootNode,
    getChildren,
    getKey: any = null,
    horizontalMargin: number,
    verticalMargin: number
  ) {
    this.getKey = getKey ?? ((node) => node.id)

    this.layout = new Layout(
      this.getWidth.bind(this),
      this.getHeight.bind(this),
      getChildren,
      this.getKey,
      horizontalMargin,
      verticalMargin
    )
    this.getRootNode = getRootNode
  }

  public recalculate() {
    const rootNode = this.getRootNode()
    const output = this.layout.calculate(rootNode)
    for (const [
      elementKey,
      localPositionSubscriber
    ] of this.onLocalPositionSubscriberByElementId.entries()) {
      localPositionSubscriber.next(output.localPositionsByKey.get(elementKey))
    }

    console.assert(this.onCalculatedSubscriber, 'Failed assertion means nobody subscribed yet.')
    this.onCalculatedSubscriber.next(output)
  }

  // registerElement must be called so that the layout knows how to get the width and height of your elements.
  public registerElement(element, elementKey) {
    this.elementByKey.set(elementKey, element)
  }

  // getLocalPositionObservable is a useful event for positioning each individual element. Note that these are local
  // positions, which means children are positioned relative to the parent. This works well with nested elements that
  // all have the "position: absolute" CSS rule.
  // When the event is fired, a Layout.Point object is passed.
  public getLocalPositionObservable(elementKey) {
    return new Observable<Point>((subscriber) => {
      this.onLocalPositionSubscriberByElementId.set(elementKey, subscriber)
    })
  }

  private getWidth(node) {
    const key = this.getKey(node)
    const element = this.elementByKey.get(key)
    return element?.offsetWidth ?? 0
  }

  private getHeight(node) {
    const key = this.getKey(node)
    const element = this.elementByKey.get(key)
    const answer = element?.offsetHeight ?? 0
    return answer
  }
}
