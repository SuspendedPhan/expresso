import type { BehaviorSubject } from "rxjs";
import type { Expr, Parent } from "src/ex-object/ExObject";

export type ExprMut = Expr & {
    mut: {
        parent$: BehaviorSubject<Parent>;
        expr$: BehaviorSubject<Expr>; 
    }
}
