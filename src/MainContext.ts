import { first } from "rxjs";
import {
  Attribute,
  Expr,
  NumberExpr,
  PrimitiveFunctionCallExpr,
} from "./Domain";
import GoModule from "./GoModule";

export class MainContext {
  goModule: GoModule;

  public createNumberExpr(value: number): NumberExpr {
    const e = new NumberExpr(value);
    this.goModule.createNumberExpr(e.getId(), value);
    return e;
  }

  public createPrimitiveFunctionCallExpr(
    args: Array<Expr>
  ): PrimitiveFunctionCallExpr {
    const e = new PrimitiveFunctionCallExpr(args);
    this.goModule.createPrimitiveFunctionCallExpr(e.getId(), args.map((arg) => arg.getId()));
    return e;
  }

  public createAttribute(): Attribute {
    const a = new Attribute();
    const goAttr = this.goModule.createAttribute(a.getId());
    a.getExpr$().pipe().subscribe((expr) => {
      goAttr.setExprId(expr.getId());
    });
    return a;
  }
}
