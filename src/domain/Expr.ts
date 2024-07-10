import { BehaviorSubject } from "rxjs";

export class Expr {
    public readonly id: string = crypto.randomUUID();
}

export class NumberExpr extends Expr {
    readonly value$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    public constructor(value: number = 0) {
        super();
        this.value$.next(value);
    }
}

export class CallExpr extends Expr {
    readonly args: BehaviorSubject<BehaviorSubject<Expr>[]> = new BehaviorSubject<BehaviorSubject<Expr>[]>([]);

    public constructor() {
        super();
        const arg0 = new NumberExpr();
        const arg1 = new NumberExpr();
        this.args.next([
            new BehaviorSubject<Expr>(arg0),
            new BehaviorSubject<Expr>(arg1)
        ]);
    }
}

