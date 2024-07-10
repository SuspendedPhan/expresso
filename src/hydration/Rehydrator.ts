import {
  // Attribute,
  // Expr,
  // NumberExpr,
  // PrimitiveFunctionCallExpr,
} from "../Domain";
import {
  DehydratedAttribute,
  DehydratedExprBase,
  DehydratedNumberExpr,
  DehydratedPrimitiveFunctionCallExpr,
} from "./Dehydrator";

export default class Rehydrator {
  public static rehydrateAttribute(dehydrated: DehydratedAttribute): Attribute {
    return new Attribute(this.rehydrateExpr(dehydrated.expr));
  }

  private static rehydrateExpr(dehydrated: DehydratedExprBase): Expr {
    if (dehydrated.exprType === "NumberExpr") {
      return this.rehydrateNumberExpr(dehydrated as DehydratedNumberExpr);
    } else if (dehydrated.exprType === "PrimitiveFunctionCallExpr") {
      return this.rehydratePrimitiveFunctionCallExpr(
        dehydrated as DehydratedPrimitiveFunctionCallExpr
      );
    } else {
      throw new Error("Unknown expr type");
    }
  }

  private static rehydrateNumberExpr(
    dehydrated: DehydratedNumberExpr
  ): NumberExpr {
    return new NumberExpr(dehydrated.value);
  }

  private static rehydratePrimitiveFunctionCallExpr(
    dehydrated: DehydratedPrimitiveFunctionCallExpr
  ): PrimitiveFunctionCallExpr {
    const args = this.rehydrateArgs(dehydrated.args);
    return new PrimitiveFunctionCallExpr(args);
  }

  private static rehydrateArgs(
    dehydratedArgs: Array<DehydratedExprBase>
  ): Array<Expr> {
    return dehydratedArgs.map((dehydratedArg) => {
      return this.rehydrateExpr(dehydratedArg);
    });
  }
}
