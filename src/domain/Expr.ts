import { BehaviorSubject, Observable } from "rxjs";

export interface ReadonlyExpr {
    readonly id: string;
}

export interface ReadonlyNumberExpr extends ReadonlyExpr {
    readonly value$: Observable<number>;
}

export interface ReadonlyCallExpr extends ReadonlyExpr {
    readonly args: Observable<Observable<ReadonlyExpr>[]>;
}

