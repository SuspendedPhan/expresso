import { first } from "rxjs";
import {
  Attribute,
  Expr,
  NumberExpr,
  PrimitiveFunctionCallExpr,
} from "./Domain";
import type GoModule from "./GoModule";

export default class MainContext {
  private attribute: Attribute;

  public constructor(private goModule: GoModule) {
    this.attribute = this.createAttribute();
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
      goExpr.setArgIds(args.map((arg) => arg.getId()));
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

  public getRootAttributeExprId(): string {
    return this.goModule.getRootAttributeExprId();
  }

  public eval(): number {
    return this.goModule.eval();
  }
}
