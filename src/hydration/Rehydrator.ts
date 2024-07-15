import ExprFactory, { Attribute, CallExpr, Expr, NumberExpr } from "../ExprFactory";
import { loggedMethod } from "../logger/LoggerDecorator";
import {
  DehydratedAttribute,
  DehydratedCallExpr,
  DehydratedExpr,
  DehydratedNumberExpr,
} from "./Dehydrator";

let nextId = 0;

export default class Rehydrator {
  public constructor(private readonly exprFactory: ExprFactory) {}

  @loggedMethod
  public rehydrateAttribute(deAttribute: DehydratedAttribute): Attribute {
    const expr = this.rehydrateExpr(deAttribute.expr);
    return this.exprFactory.createAttribute(deAttribute.id + "rehydrated" + nextId++, expr);
  }

  @loggedMethod
  private rehydrateExpr(deExpr: DehydratedExpr): Expr {
    switch (deExpr.type) {
      case "NumberExpr":
        return this.rehydrateNumberExpr(deExpr);
      case "CallExpr":
        return this.rehydrateCallExpr(deExpr);
      default:
        throw new Error(`Unknown expr type: ${deExpr}`);
    }
  }
  
  @loggedMethod
  private rehydrateNumberExpr(deExpr: DehydratedNumberExpr): NumberExpr {
    return this.exprFactory.createNumberExpr(deExpr.value, deExpr.id + "rehydrated" + nextId++);
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg)=>this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(deExpr.id + "rehydrated" + nextId++, args);
  }
}
