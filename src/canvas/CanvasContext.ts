import { Graphics } from "pixi.js";
import { Evaluator } from "../evaluation/Evaluator";
import MainContext from "src/main-context/MainContext";
import PixiFactory, { PixiCtx } from "./PixiFactory";
import ScenePool from "./CanvasPool";
import { Context, Effect, Layer } from "effect";

export type LibCanvasObject = Graphics;

export class CanvasContext {
  public readonly pool = new ScenePool(() => this.pixiFactory.makeCircle());
  public readonly evaluator;

  constructor(public readonly mainCtx: MainContext, public readonly pixiFactory: PixiFactory) {
    this.evaluator = new Evaluator(mainCtx);
  }
}



export class CanvasCtx extends Context.Tag("CanvasCtx")<
  CanvasCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const pixiCtx = yield *PixiCtx;
    return {
        pool: new ScenePool(() => pixiCtx.makeCircle()),
    };
});

export const CanvasCtxLive = Layer.effect(
  CanvasCtx,
  ctxEffect
);


