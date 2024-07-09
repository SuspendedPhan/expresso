import { Observable } from "rxjs";
import { Attribute } from "../Domain";

export default class CircleComponent {
    public constructor(private x$: Observable<Attribute>, private y$: Observable<Attribute>, private radius$: Observable<Attribute>) {}

    public getX$(): Observable<Attribute> {
        return this.x$;
    }

    public getY$(): Observable<Attribute> {
        return this.y$;
    }

    public getRadius$(): Observable<Attribute> {
        return this.radius$;
    }
}