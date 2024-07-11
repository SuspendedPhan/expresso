import ExprFactory, { Attribute, CallExpr, Expr, NumberExpr } from "../ExprFactory";
import {
  DehydratedAttribute,
  DehydratedCallExpr,
  DehydratedExpr,
  DehydratedNumberExpr,
} from "./Dehydrator";

export default class Rehydrator {
  public constructor(private readonly exprFactory: ExprFactory) {}

  public rehydrateAttribute(deAttribute: DehydratedAttribute): Attribute {
    const expr = this.rehydrateExpr(deAttribute.expr);
    return this.exprFactory.createAttribute(deAttribute.id, expr);
  }

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

  private rehydrateNumberExpr(deExpr: DehydratedNumberExpr): NumberExpr {
    return this.exprFactory.createNumberExpr(deExpr.value, deExpr.id);
  }

  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg)=>this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(deExpr.id, args);
  }
}
