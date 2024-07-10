import { Observable } from "rxjs";
import { ReadonlyAttribute } from "../Domain";

export default class CircleComponent {
    public constructor(private x$: Observable<ReadonlyAttribute>, private y$: Observable<ReadonlyAttribute>, private radius$: Observable<ReadonlyAttribute>) {}

    public getX$(): Observable<ReadonlyAttribute> {
        return this.x$;
    }

    public getY$(): Observable<ReadonlyAttribute> {
        return this.y$;
    }

    public getRadius$(): Observable<ReadonlyAttribute> {
        return this.radius$;
    }
}