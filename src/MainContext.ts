import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExObjectFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./Replacer";
import ExObjectManager from "./ExObjectManager";

export default class MainContext {
  public readonly replacer: MainMutator;
  public readonly exprManager = new ExObjectManager();
  public readonly selection = new Selection(this.exprManager);
  public readonly exprFactory = new ExprFactory(this.exprManager);

  public constructor(
    public readonly goModule: GoModule,
  ) {
    new GoBridge(goModule, this.exprFactory);
    this.replacer = new MainMutator(this);
  }
}
