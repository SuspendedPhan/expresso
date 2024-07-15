import { Observable, Subject } from "rxjs";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";
import ExObjectManager from "./ExObjectManager";

let nextId = 0;

export enum ExObjectType {
  Expr,
  Attribute,
}
export enum ExprType {
  NumberExpr,
  CallExpr,
}

interface ExObjectBase {
  readonly objectType: ExObjectType;
  readonly id: string;
}

export interface Attribute extends ExObjectBase {
  readonly objectType: ExObjectType.Attribute;
  readonly expr$: Observable<Expr>;
}

export type Expr = NumberExpr | CallExpr;
export type Parent = Attribute | CallExpr | null;

export interface NumberExpr extends ExObjectBase {
  readonly objectType: ExObjectType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

export interface CallExpr extends ExObjectBase {
  readonly objectType: ExObjectType.Expr;
  readonly exprType: ExprType.CallExpr;
  readonly args: readonly Observable<Expr>[];
}

export type ExObject = Attribute | Expr;

export default class ExprFactory {
  private readonly onNumberExprAdded$_ = new Subject<NumberExpr>();
  private readonly onCallExprAdded$_ = new Subject<CallExpr>();
  private readonly onAttributeAdded$_ = new Subject<Attribute>();

  public readonly onNumberExprAdded$: Observable<NumberExpr> =
    this.onNumberExprAdded$_;
  public readonly onCallExprAdded$: Observable<CallExpr> =
    this.onCallExprAdded$_;
  public readonly onAttributeAdded$: Observable<Attribute> =
    this.onAttributeAdded$_;

  public constructor(private readonly exprManager: ExObjectManager) {}

  @loggedMethod
  public createAttribute(id?: string, expr?: Expr): Attribute {
    const logger = Logger.logger();

    if (id === undefined) {
      id = `attribute-${nextId++}`;
      logger.log("id", "not given", id);
    } else {
      logger.log("id", "given", id);
    }

    if (expr === undefined) {
      expr = this.createNumberExpr();
    }

    const expr$ = this.exprManager.createObject$(expr);

    const attribute: Attribute = {
      objectType: ExObjectType.Attribute,
      id,
      expr$,
    };
    this.onAttributeAdded$_.next(attribute);
    return attribute;
  }

  @loggedMethod
  public createNumberExpr(value?: number, id?: string): NumberExpr {
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const expr: NumberExpr = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.NumberExpr,
      id,
      value,
    };

    this.onNumberExprAdded$_.next(expr);
    return expr;
  }

  @loggedMethod
  public createCallExpr(id?: string, args?: readonly Expr[]): CallExpr {
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }
    const argSubjects = args.map((arg) => this.exprManager.createObject$(arg));

    const expr: CallExpr = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.CallExpr,
      id,
      args: argSubjects,
    };

    this.onCallExprAdded$_.next(expr);
    return expr;
  }
}
