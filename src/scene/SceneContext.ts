import { Graphics } from "pixi.js";
import { Evaluator } from "../evaluation/Evaluator";
import MainContext from "src/main-context/MainContext";
import PixiFactory from "./PixiFactory";
import ScenePool from "./ScenePool";

export type SceneObject = Graphics;

export class SceneContext {
  public readonly pool = new ScenePool(() => this.pixiFactory.makeCircle());
  public readonly evaluator = new Evaluator(this.mainCtx);

  constructor(public readonly mainCtx: MainContext, public readonly pixiFactory: PixiFactory) {}
}
