import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./MainMutator";
import ExObjectFactory from "./ExObjectFactory";

export default class MainContext {
  public readonly mutator: MainMutator;
  public readonly objectFactory = new ExObjectFactory();
  public readonly selection = new Selection();
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);
  }
}
