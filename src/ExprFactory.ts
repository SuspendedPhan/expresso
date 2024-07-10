import {
  BehaviorSubject,
  Observable,
  Subject,
} from "rxjs";
import Logger from "./utils/Logger";

const logger = Logger.file("ExprFactory.ts");

export interface Attribute {
  readonly type: "Attribute";
  readonly id: string;
  readonly expr$: Subject<Expr>;
}

export type Expr = NumberExpr | CallExpr;
export type Parent = Attribute | CallExpr | null;

export interface NumberExpr {
  readonly type: "NumberExpr";
  readonly id: string;
  readonly value: number;
  readonly parent$: Subject<Parent>;
}

export interface CallExpr {
  readonly type: "CallExpr";
  readonly id: string;
  readonly args: Subject<Expr>[];
  readonly parent$: Subject<Parent>;
}

export default class ExprFactory {
  private readonly onNumberExprAdded$_ = new Subject<NumberExpr>();
  private readonly onCallExprAdded$_ = new Subject<CallExpr>();
  
  public readonly onNumberExprAdded$: Observable<NumberExpr> = this.onNumberExprAdded$_;
  public readonly onCallExprAdded$: Observable<CallExpr> = this.onCallExprAdded$_;
  
  public createAttribute(): Attribute {
    const expr = this.createNumberExpr(0);

    const expr$ = new BehaviorSubject<Expr>(expr);
    const attribute: Attribute = {
      type: "Attribute",
      id: `attribute-${Math.random()}`,
      expr$,
    };

    return attribute;
  }

  public createNumberExpr(value: number): NumberExpr {
    const expr: NumberExpr = {
      type: "NumberExpr",
      id: `expr-${Math.random()}`,
      value,
      parent$: new BehaviorSubject<Parent>(null),
    };
    this.onNumberExprAdded$_.next(expr);
    return expr;
  }

  public createCallExpr(): CallExpr {
    const arg0$ = new BehaviorSubject<Expr>(this.createNumberExpr(0));
    const arg1$ = new BehaviorSubject<Expr>(this.createNumberExpr(0));
    const expr: CallExpr = {
      type: "CallExpr",
      id: `expr-${Math.random()}`,
      args: [arg0$, arg1$],
      parent$: new BehaviorSubject<Parent>(null),
    };
    this.onCallExprAdded$_.next(expr);
    return expr;
  }
}
