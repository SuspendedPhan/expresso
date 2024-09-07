import { Context, Effect, Layer } from "effect";
import {
  interval,
  Subject
} from "rxjs";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import type { Evaluation } from "src/utils/utils/GoModule";


export class EvaluatorCtx extends Context.Tag("EvaluatorCtx")<
  EvaluatorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const goModuleCtx = yield* GoModuleCtx;
  const goModule = yield* goModuleCtx.goModule;
  
  const eval$ = new Subject<Evaluation>();
  interval(1000).subscribe(() => {
    const evaluation = goModule.Evaluator.eval();
    eval$.next(evaluation);
    evaluation.dispose();
  });

  return {
    eval$,
  };
});

export const EvaluatorCtxLive = Layer.effect(
  EvaluatorCtx,
  ctxEffect
);
