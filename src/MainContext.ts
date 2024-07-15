import type GoModule from "./utils/GoModule";
import ExObjectFactory from "./ExObjectFactory";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./MainMutator";
import ExObjectManager from "./ExObjectManager";

export default class MainContext {
  public readonly mutator: MainMutator;
  public readonly objectManager = new ExObjectManager();
  public readonly objectFactory = new ExObjectFactory(this.objectManager);
  public readonly selection = new Selection(this.objectManager);

  public constructor(
    public readonly goModule: GoModule,
  ) {
    new GoBridge(goModule, this.objectFactory);
    this.mutator = new MainMutator(this);
  }
}
