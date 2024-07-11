import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExprFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";

export default class MainContext {
  public constructor(
    public readonly goModule: GoModule,
    public readonly exprFactory: ExprFactory,
    public readonly selection: Selection,
  ) {
    new GoBridge(goModule, exprFactory);
  }
}
