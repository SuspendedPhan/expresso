import { BehaviorSubject } from "rxjs";
import { Attribute, CallExpr, ExObject, ExObjectType, Expr, ExprType, NumberExpr, Parent } from "./ExObject";
import ExObjectManager from "./ExObjectManager";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";

let nextId = 0;

type ExObjectMut = ExObject & {
  parentMut$: BehaviorSubject<Parent>;
}

type CallExprMut = CallExpr & ExObjectMut & {
  argsMut$: BehaviorSubject<Expr[]>;
}

export default class ExObjectFactory {
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

    const parentMut$ = new BehaviorSubject<Parent>(null);

    const attribute: Attribute & ExObjectMut = {
      objectType: ExObjectType.Attribute,
      id,
      expr$,
      parent$: parentMut$,
      parentMut$,
    };
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

    const parentMut$ = new BehaviorSubject<Parent>(null);

    const expr: NumberExpr & ExObjectMut = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.NumberExpr,
      id,
      value,
      parent$: parentMut$,
      parentMut$,
    };

    return expr;
  }

  @loggedMethod
  public createCallExpr(id?: string, args?: Expr[]): CallExpr {
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }

    const argsMut$ = new BehaviorSubject<Expr[]>(args);
    const parentMut$ = new BehaviorSubject<Parent>(null);

    const expr: CallExprMut = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.CallExpr,
      id,
      args$: argsMut$,
      argsMut$,
      parent$: parentMut$,
      parentMut$,
    };

    return expr;
  }
}
