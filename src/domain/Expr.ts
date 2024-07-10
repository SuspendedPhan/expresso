import { BehaviorSubject, Observable } from "rxjs";

export class ReadonlyExpr {
    public readonly id = `expr-${Math.random()}`;
}

export class ReadonlyNumberExpr extends ReadonlyExpr {
    public constructor(public readonly value$: Observable<number>) {
        super();
    }
}

export class ReadonlyCallExpr extends ReadonlyExpr {
    // readonly args$: Observable<Observable<ReadonlyExpr>[]>;
    public constructor(public readonly args$: Observable<Observable<ReadonlyExpr>[]>) {
        super();
    }
}

