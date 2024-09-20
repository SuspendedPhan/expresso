import { Effect, Layer, Schedule } from "effect";
import { Subject } from "rxjs";
import { GoModuleCtx, GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import type { Evaluation } from "src/utils/utils/GoModule";

export class EvaluatorCtx extends Effect.Tag("EvaluatorCtx")<
  EvaluatorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const goModuleCtx = yield* GoModuleCtx;
  const eval$ = new Subject<Evaluation>();

  const effect = goModuleCtx.withGoModule((goModule) => {
    return Effect.gen(function* () {
      const evaluation = goModule.Evaluator.eval();
      eval$.next(evaluation);
      evaluation.dispose();
    });
  });

  yield* Effect.repeat(effect, Schedule.fixed(1000));

  return {
    eval$,
  };
});

export const EvaluatorCtxLive = Layer.effect(EvaluatorCtx, ctxEffect).pipe(
  Layer.provideMerge(GoModuleCtxLive)
);
