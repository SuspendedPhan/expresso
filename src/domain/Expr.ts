import { Observable } from "rxjs";

export class Expr {
    public getParent$(): Observable<Parent | null> {
    }

    public getExprKind$(): Observable<ExprKind> {

    }
}

type ExprKind = NumberExpr | CallExpr;

export class NumberExpr {
    public getValue$(): Observable<number> {}
}

export class CallExpr {
    public getFunctionName$(): Observable<string> {}
    public getArgs$(): Observable<Expr[]> {}
}