import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExprFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import Replacer from "./Replacer";
import { loggedMethod } from "./logger/LoggerDecorator";

export default class MainContext {
  public readonly replacer: Replacer;

  public constructor(
    public readonly goModule: GoModule,
    public readonly exprFactory: ExprFactory,
    public readonly selection: Selection,
  ) {
    new GoBridge(goModule, exprFactory);
    this.replacer = new Replacer(exprFactory);
    this.replacer.onExprReplaced$.subscribe(({ oldExpr, newExpr }) => {
      console.log("Expr replaced", oldExpr, newExpr);
      
      if (this.selection.selectedObject$.value === oldExpr) {
        console.log("Updating selection");
        
        this.selection.selectedObject$.next(newExpr);
      }
    });
  }
}
