import { Observable, of } from "rxjs";
import ObservableArray from "../utils/ObservableArray";

export type Expr = NumberExpr;

export class BaseExpr {
    private id = crypto.randomUUID();

    // public getParent$(): Observable<Parent | null> {
    // }

    public getId$(): Observable<string> {
        return of(this.id);
    }
}

type ExprKind = NumberExpr | CallExpr;

export class NumberExpr {
    private baseExpr = new BaseExpr();

    public constructor(private value: number) {}

    public getValue$(): Observable<number> {
        return of(this.value);
    }

    public getBaseExpr(): BaseExpr {
        return this.baseExpr;
    }
}

export class CallExpr {
    private args$ = new ObservableArray<Observable<Expr>>();
    public constructor() {
        this.args$.push(of(new NumberExpr(0)));
        this.args$.push(of(new NumberExpr(0)));
    }

    // public getFunctionName$(): Observable<string> {}
    public getArgs$(): ObservableArray<Observable<Expr>> {
        return this.args$;
    }
}