import { BehaviorSubject, Observable } from "rxjs";

export type ReadonlyExpr = ReadonlyNumberExpr | ReadonlyCallExpr;

export interface ReadonlyExprBase {
    readonly id: string;
}

export interface ReadonlyNumberExpr extends ReadonlyExprBase {
    readonly type: "NumberExpr";
    readonly value$: Observable<number>;
}

export interface ReadonlyCallExpr extends ReadonlyExprBase {
    readonly type: "CallExpr";
    readonly args$: Observable<Observable<ReadonlyExpr>[]>;
}

