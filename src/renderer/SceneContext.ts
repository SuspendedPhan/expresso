import MainContext from "../MainContext";
import PixiFactory from "./PixiFactory";
import ScenePool from "./ScenePool";

export class SceneContext {
  public readonly pool = new ScenePool(() => this.pixiFactory.makeCircle());

  constructor(public readonly mainCtx: MainContext, public readonly pixiFactory: PixiFactory) {}
}
