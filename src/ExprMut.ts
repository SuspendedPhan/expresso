import { BehaviorSubject } from "rxjs";
import { Expr, Parent } from "./ExObjectFactory";

export type ExprMut = Expr & {
    mut: {
        parent$: BehaviorSubject<Parent>;
        expr$: BehaviorSubject<Expr>; 
    }
}
