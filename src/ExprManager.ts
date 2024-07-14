import { BehaviorSubject } from "rxjs";
import { Expr } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

export default class ExprManager {
    private readonly expr$ByExpr_ = new Map<Expr, BehaviorSubject<Expr>>();
    public readonly expr$ByExpr: ReadonlyMap<Expr, BehaviorSubject<Expr>> = this.expr$ByExpr_;

    @loggedMethod
    public create$(expr: Expr): BehaviorSubject<Expr> {
        Logger.logCallstack();
        Logger.arg("expr", expr.id);
        const expr$ = new BehaviorSubject<Expr>(expr);
        this.expr$ByExpr_.set(expr, expr$);
        return expr$;
    }

    public replace(expr: Expr, newExpr: Expr) {
        const expr$ = this.expr$ByExpr_.get(expr);
        if (!expr$) {
            throw new Error(`expr$ not found for ${expr}`);
        }
        this.expr$ByExpr_.set(newExpr, expr$);
        this.expr$ByExpr_.delete(expr);
        expr$.next(newExpr);
    }
}