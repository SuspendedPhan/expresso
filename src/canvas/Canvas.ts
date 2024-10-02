// File: Canvas.ts

import { Effect } from "effect";
import type { Graphics } from "pixi.js";
import CanvasPool from "src/canvas/CanvasPool";
import { PixiFactory, type PixiFactoryArgs } from "src/canvas/PixiFactory";
import { EvaluatorCtx } from "src/evaluation/EvaluatorCtx";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("Canvas.ts", 9);
log55.debug("Canvas.ts");

export type LibCanvasObject = Graphics;

export function CanvasFactory(args: PixiFactoryArgs) {
  const pixiFactory = PixiFactory(args);
  const pool = new CanvasPool(() => pixiFactory.makeCircle());

  return Effect.gen(function* () {
    const evaluatorCtx = yield* EvaluatorCtx;
    evaluatorCtx.onEval.add((result) => {
      return Effect.gen(function* () {
        
      });
    });
  });
}
