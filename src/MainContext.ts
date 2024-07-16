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
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);
  }
}
