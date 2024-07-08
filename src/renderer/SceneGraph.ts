import { combineLatest, combineLatestAll, Observable, Subject, switchMap } from "rxjs";
import { Attribute } from "../Domain";
import PixiRenderer from "./PixiRenderer";

export default class SceneGraph {
  constructor(private pixiRenderer: PixiRenderer) {}

  public addCircle(circleComponent$: Observable<CircleComponent>) {
    const circle: PixiCircle = this.pixiRenderer.takeCircle();
    circleComponent$.subscribe((circleComponent) => {
        circleComponent.getX$().subscribe((x) => circle.x = x);
        circleComponent.getY$().subscribe((y) => circle.y = y);
        circleComponent.getRadius$().subscribe((radius) => circle.radius = radius);
    });
  }
}

export class Circle {
    constructor(private x: Observable<number>, private y: Observable<number>, private radius: Observable<number>) {}
}

export class CircleComponent {
    private readonly x$_: Observable<number>;
    private readonly y$_: Observable<number>;
    private readonly radius$_: Observable<number>;

    constructor(private x$: Observable<Attribute>, private y$: Observable<Attribute>, private radius$: Observable<Attribute>) {
        this.x$_ = x$.pipe(switchMap((x) => x.eval$()));
        this.y$_ = y$.pipe(switchMap((y) => y.eval$()));
        this.radius$_ = radius$.pipe(switchMap((radius) => radius.eval$()));
    }

    public getX$(): Observable<number> {
        return this.x$_;
    }

    public getY$(): Observable<number> {
        return this.y$_;
    }

    public getRadius$(): Observable<number> {
        return this.radius$_;
    }
}

export class PixiCircle {
    constructor(public x: number, public y: number, public radius: number) {}
}
