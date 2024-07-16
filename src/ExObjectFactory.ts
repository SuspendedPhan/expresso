import { Attribute, CallExpr, ExObjectType, Expr, ExprType, NumberExpr } from "./ExObject";
import ExObjectManager from "./ExObjectManager";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";

let nextId = 0;

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

    const attribute: Attribute = {
      objectType: ExObjectType.Attribute,
      id,
      expr$,
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

    const expr: NumberExpr = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.NumberExpr,
      id,
      value,
    };

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

    return expr;
  }
}
