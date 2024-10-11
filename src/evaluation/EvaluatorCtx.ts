import { Effect, Layer, Schedule } from "effect";
import { GoModuleCtx, GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import { GlobalPropertyCtx } from "src/ex-object/GlobalProperty";
import type { EvaluationResult } from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("EvaluatorCtx.ts");

export class EvaluatorCtx extends Effect.Tag("EvaluatorCtx")<
  EvaluatorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const goModuleCtx = yield* GoModuleCtx;
  const globalPropertyCtx = yield* GlobalPropertyCtx;

  const onEval = new Set<
    (result: EvaluationResult) => Effect.Effect<void, never, never>
  >();

  const effect = goModuleCtx.withGoModule((goModule) => {
    return Effect.gen(function* () {
      const gps = globalPropertyCtx.globalProperties.map((gp) => {
        return Effect.gen(function* () {
          return {
            id: gp.id,
            value: yield* gp.eval(),
          };
        });
      });
      const gps2 = yield* Effect.all(gps);
      const evaluation = goModule.Evaluator.eval(gps2);

      // console.log("Got result from Evaluator.eval()");

      if (evaluation !== null) {
        for (const cb of onEval) {
          yield* cb(evaluation);
        }
        evaluation.dispose();
      }
      log55.log3(9, "eval done");
    });
  });

  yield* Effect.forkDaemon(Effect.repeat(effect, Schedule.fixed(1000 / 45)));

  return {
    onEval,
  };
});

export const EvaluatorCtxLive = Layer.effect(EvaluatorCtx, ctxEffect).pipe(
  Layer.provideMerge(GoModuleCtxLive)
);
