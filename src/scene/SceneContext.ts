import { Evaluator } from "../evaluation/Evaluator";
import MainContext from "../MainContext";
import PixiFactory from "./PixiFactory";
import ScenePool from "./ScenePool";

export class SceneContext {
  public readonly pool = new ScenePool(() => this.pixiFactory.makeCircle());
  public readonly evaluator = new Evaluator(this.mainCtx);

  constructor(public readonly mainCtx: MainContext, public readonly pixiFactory: PixiFactory) {}
}
