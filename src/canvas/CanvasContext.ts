import { Graphics } from "pixi.js";
import { Evaluator } from "../evaluation/Evaluator";
import MainContext from "src/main-context/MainContext";
import PixiFactory from "./PixiFactory";
import ScenePool from "./CanvasPool";

export type LibCanvasObject = Graphics;

export class CanvasContext {
  public readonly pool = new ScenePool(() => this.pixiFactory.makeCircle());
  public readonly evaluator = new Evaluator(this.mainCtx);

  constructor(public readonly mainCtx: MainContext, public readonly pixiFactory: PixiFactory) {}
}
