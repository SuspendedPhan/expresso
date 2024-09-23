import { Effect, Layer, Schedule } from "effect";
import { Subject } from "rxjs";
import { GoModuleCtx, GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import type { Evaluation } from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("EvaluatorCtx.ts");

export class EvaluatorCtx extends Effect.Tag("EvaluatorCtx")<
  EvaluatorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const goModuleCtx = yield* GoModuleCtx;
  const eval$ = new Subject<Evaluation>();

  const effect = goModuleCtx.withGoModule((goModule) => {
    return Effect.gen(function* () {
      log55.debug("eval");
      const evaluation = goModule.Evaluator.eval();
      log55.debug("eval2");
      eval$.next(evaluation);
      log55.debug("eval3");
      if (evaluation !== null) {
        evaluation.dispose();
      }
      log55.debug("eval done");
    });
  });

  yield* Effect.forkDaemon(Effect.repeat(effect, Schedule.fixed(1000)));

  return {
    eval$,
  };
});


export const EvaluatorCtxLive = Layer.effect(EvaluatorCtx, ctxEffect).pipe(
  Layer.provideMerge(GoModuleCtxLive)
);
