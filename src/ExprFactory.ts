import { Observable, Subject } from "rxjs";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";
import ExprManager from "./ExprManager";

let nextId = 0;

export interface Attribute {
  readonly type: "Attribute";
  readonly id: string;
  readonly expr$: Observable<Expr>;
}

export type Expr = NumberExpr | CallExpr;
export type Parent = Attribute | CallExpr | null;

export interface NumberExpr {
  readonly type: "NumberExpr";
  readonly id: string;
  readonly value: number;
}

export interface CallExpr {
  readonly type: "CallExpr";
  readonly id: string;
  readonly args: readonly Observable<Expr>[];
}

export type ExObject = Attribute | Expr;

export default class ExprFactory {
  private readonly onNumberExprAdded$_ = new Subject<NumberExpr>();
  private readonly onCallExprAdded$_ = new Subject<CallExpr>();

  public readonly onNumberExprAdded$: Observable<NumberExpr> =
    this.onNumberExprAdded$_;
  public readonly onCallExprAdded$: Observable<CallExpr> =
    this.onCallExprAdded$_;

  public readonly exprManager = new ExprManager();

  public createAttribute(id?: string, expr?: Expr): Attribute {
    const logger = Logger.logger();
    Logger.logCallstack();

    if (id === undefined) {
      id = `attribute-${nextId++}`;
      logger.log("id", "not given", id);
    } else {
      logger.log("id", "given", id);
    }

    if (expr === undefined) {
      expr = this.createNumberExpr();
    }

    const expr$ = this.exprManager.createExpr$(expr);

    return {
      type: "Attribute",
      id,
      expr$,
    };
  }

  @loggedMethod
  public createNumberExpr(value?: number, id?: string): NumberExpr {
    Logger.logCallstack();
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const expr: NumberExpr = {
      type: "NumberExpr",
      id,
      value,
    };

    this.onNumberExprAdded$_.next(expr);
    return expr;
  }

  @loggedMethod
  public createCallExpr(id?: string, args?: readonly Expr[]): CallExpr {
    Logger.logCallstack();
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }
    const argSubjects = args.map((arg) => this.exprManager.createExpr$(arg));

    const expr: CallExpr = {
      type: "CallExpr",
      id,
      args: argSubjects,
    };

    this.onCallExprAdded$_.next(expr);
    return expr;
  }
}
