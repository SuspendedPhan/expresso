import { Graphics } from "pixi.js";
import { Evaluator } from "../evaluation/EvaluatorCtx";
import MainContext from "src/main-context/MainContext";
import PixiFactory, { PixiCtx } from "./PixiFactory";
import ScenePool from "./CanvasPool";
import { Context, Effect, Layer } from "effect";

export type LibCanvasObject = Graphics;

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


