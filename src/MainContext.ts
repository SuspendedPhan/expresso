import Dehydrator from "./hydration/Dehydrator";
import {
  Attribute,
  Expr,
  NumberExpr,
  PrimitiveFunctionCallExpr,
} from "./Domain";
import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";

export default class MainContext {
  public attribute: Attribute;
  public selection: Selection;

  public constructor(private goModule: GoModule) {
    this.attribute = this.createAttribute();
    this.selection = new Selection(this.attribute);
    goModule.setRootAttributeId(this.attribute.getId());
  }

  public createNumberExpr(value: number): NumberExpr {
    const e = new NumberExpr(value);
    this.goModule.createNumberExpr(e.getId(), value);
    return e;
  }

  public createPrimitiveFunctionCallExpr(
    args: Array<Expr>
  ): PrimitiveFunctionCallExpr {
    const e = new PrimitiveFunctionCallExpr(args);
    const goExpr = this.goModule.createPrimitiveFunctionCallExpr(e.getId());
    e.getArgs$().subscribe((args) => {
      const argIds = args.map((arg) => arg.getId());
      console.log("MainContext.ts: setting arg ids", argIds);
      // console.log("MainContext.ts: setting arg ids", args.map((arg) => arg.getId()));
      goExpr.setArgIds(argIds);
    });
    return e;
  }

  public createAttribute(): Attribute {
    const a = new Attribute(this.createNumberExpr(0));
    const goAttr = this.goModule.createAttribute(a.getId());
    a.getExpr$().pipe().subscribe((expr) => {
      console.log("setting expr id", expr.getId());
      goAttr.setExprId(expr.getId());
    });
    return a;
  }

  public eval(): number {
    return this.goModule.eval();
  }
}
