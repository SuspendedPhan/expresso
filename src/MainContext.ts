import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExprFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./Replacer";
import ExprManager from "./ExprManager";

export default class MainContext {
  public readonly replacer: MainMutator;
  public readonly exprManager = new ExprManager();
  public readonly selection = new Selection(this.exprManager);

  public constructor(
    public readonly goModule: GoModule,
    public readonly exprFactory: ExprFactory,
  ) {
    new GoBridge(goModule, this.exprFactory);
    this.replacer = new MainMutator(this);
  }
}
