import {
  BehaviorSubject,
  Observable,
  Subject,
} from "rxjs";
import Logger from "./utils/Logger";

const logger = Logger.file("ExprFactory.ts");
let nextId = 0;

export interface Attribute {
  readonly type: "Attribute";
  readonly id: string;
  readonly expr$: BehaviorSubject<Expr>;
}

export type Expr = NumberExpr | CallExpr;
export type Parent = Attribute | CallExpr | null;

export interface NumberExpr {
  readonly type: "NumberExpr";
  readonly id: string;
  readonly value: number;
  readonly parent$: BehaviorSubject<Parent>;
}

export interface CallExpr {
  readonly type: "CallExpr";
  readonly id: string;
  readonly args: BehaviorSubject<Expr>[];
  readonly parent$: BehaviorSubject<Parent>;
}

export type ExObject = Attribute | Expr;

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class ExprFactory {
  private readonly onExprReplaced$_ = new Subject<ExprReplacement>();
  private readonly onNumberExprAdded$_ = new Subject<NumberExpr>();
  private readonly onCallExprAdded$_ = new Subject<CallExpr>();
  
  public readonly onExprReplaced$: Observable<ExprReplacement> = this.onExprReplaced$_;
  public readonly onNumberExprAdded$: Observable<NumberExpr> = this.onNumberExprAdded$_;
  public readonly onCallExprAdded$: Observable<CallExpr> = this.onCallExprAdded$_;
  
  public createAttribute(): Attribute {
    const expr = this.createNumberExpr(0);

    const expr$ = new BehaviorSubject<Expr>(expr);
    const attribute: Attribute = {
      type: "Attribute",
      id: `attribute-${nextId++}`,
      expr$,
    };

    expr.parent$.next(attribute);
    
    return attribute;
  }

  public createNumberExpr(value: number): NumberExpr {
    const expr: NumberExpr = {
      type: "NumberExpr",
      id: `expr-${nextId++}`,
      value,
      parent$: new BehaviorSubject<Parent>(null),
    };

    this.onNumberExprAdded$_.next(expr);
    return expr;
  }

  public createCallExpr(): CallExpr {
    const arg0 = this.createNumberExpr(0);
    const arg1 = this.createNumberExpr(0);
    const arg0$ = new BehaviorSubject<Expr>(arg0);
    const arg1$ = new BehaviorSubject<Expr>(arg1);
    const expr: CallExpr = {
      type: "CallExpr",
      id: `expr-${nextId++}`,
      args: [arg0$, arg1$],
      parent$: new BehaviorSubject<Parent>(null),
    };
    arg0.parent$.next(expr);
    arg1.parent$.next(expr);

    this.onCallExprAdded$_.next(expr);
    return expr;
  }

  public replaceWithNumberExpr(expr$: BehaviorSubject<Expr>, value: number) {
    const expr = this.createNumberExpr(value);
    this.replaceWithExpr(expr$, expr);
  }

  public replaceWithCallExpr(expr$: BehaviorSubject<Expr>) {
    const expr = this.createCallExpr();
    this.replaceWithExpr(expr$, expr);
  }

  private replaceWithExpr(expr$: BehaviorSubject<Expr>, newExpr: Expr) {
    const oldExpr = expr$.value;
    const parent = expr$.value.parent$.value;
    newExpr.parent$.next(parent);
    expr$.next(newExpr);
    
    this.onExprReplaced$_.next({ oldExpr, newExpr });
    return newExpr;
  }
}
