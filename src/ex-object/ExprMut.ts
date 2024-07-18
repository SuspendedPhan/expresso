import type { BehaviorSubject } from "rxjs";
import type { Expr, Parent } from "./ExObject";

export type ExprMut = Expr & {
    mut: {
        parent$: BehaviorSubject<Parent>;
        expr$: BehaviorSubject<Expr>; 
    }
}
