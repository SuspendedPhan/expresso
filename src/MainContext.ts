import { CallExpr, Expr, NumberExpr } from "./domain/Expr";
import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";

export default class MainContext {
  public attribute: Attribute;
  public selection: Selection;

  public constructor(private goModule: GoModule) {
    this.attribute = this.createAttribute();
    this.selection = new Selection(this.attribute);
    // goModule.setRootAttributeId(this.attribute.getId());
  }

  public createNumberExpr(value: number): NumberExpr {
    const e = new NumberExpr(value);
    e.getBaseExpr().getId$().subscribe((id) => {
      this.goModule.addValue(id, value);
    });
    return e;
  }

  public createCallExpr(): CallExpr {
    const e = new CallExpr();
    const goExpr = this.goModule.createCallExpr();
    e.getArgs$().onPush$.subscribe((expr) => {
      expr.getId$().subscribe((id) => {
        goExpr.addArg(id);
      });
    });
    return e;
  }

  public createAttribute(): Attribute {
    const a = new Attribute(this.createNumberExpr(0));
    // const goAttr = this.goModule.createAttribute(a.getId());
    // a.getExpr$().pipe().subscribe((expr) => {
    //   console.log("setting expr id", expr.getId());
    //   goAttr.setExprId(expr.getId());
    // });
    return a;
  }

  public eval(): number {
    // return this.goModule.eval();
  }
}
