import ExprFactory, { Attribute, CallExpr, NumberExpr } from "../ExprFactory";
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
    this.exprFactory.createAttribute();
    console.log(deAttribute);
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
    const arg0 = this.rehydrateExpr(deExpr.args[0]);
    const arg1 = this.rehydrateExpr(deExpr.args[1]);
    return this.exprFactory.createCallExpr(arg0, arg1, deExpr.id);
  }
}
