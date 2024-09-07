import { Context, Effect, Layer } from "effect";
import {
  interval,
  Observable,
  Subject
} from "rxjs";
import type { Evaluation } from "src/utils/utils/GoModule";


export class EvaluatorCtx extends Context.Tag("EvaluatorCtx")<
  EvaluatorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  interval(1000).subscribe(() => {
    const evaluation = this.ctx.goModule.Evaluator.eval();
    this.eval$_.next(evaluation);
    evaluation.dispose();
  });
});

export const EvaluatorCtxLive = Layer.effect(
  EvaluatorCtx,
  ctxEffect
);



export class Evaluator {
  private eval$_ = new Subject<Evaluation>();
  
  public readonly eval$: Observable<Evaluation> = this.eval$_;

  public constructor(private readonly ctx: MainContext) {
    this.setup();
  }

  private setup() {
    
  }
}

