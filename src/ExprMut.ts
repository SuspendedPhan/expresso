import { BehaviorSubject } from "rxjs";
import { Expr, Parent } from "./ExObject";

export type ExprMut = Expr & {
    mut: {
        parent$: BehaviorSubject<Parent>;
        expr$: BehaviorSubject<Expr>; 
    }
}
