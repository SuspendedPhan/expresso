import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExprFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator, { ExprReplacement } from "./Replacer";
import { loggedMethod } from "./logger/LoggerDecorator";

export default class MainContext {
  public readonly replacer: MainMutator;

  public constructor(
    public readonly goModule: GoModule,
    public readonly exprFactory: ExprFactory,
    public readonly selection: Selection
  ) {
    new GoBridge(goModule, exprFactory);
    this.replacer = new MainMutator(exprFactory);
    this.replacer.onExprReplaced$.subscribe((...args) =>
      this.handleExprReplaced(...args)
    );
  }

  @loggedMethod
  private handleExprReplaced({ oldExpr, newExpr }: ExprReplacement) {
    if (this.selection.selectedObject$.value === oldExpr) {
      this.selection.selectedObject$.next(newExpr);
    }
  }
}
