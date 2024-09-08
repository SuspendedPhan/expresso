import { Context, Effect, Layer } from "effect";
import { Subject } from "rxjs";
import type { Expr } from "src/ex-object/Expr";
import { createObservableArrayWithLifetime } from "src/utils/utils/ObservableArray";

export class ExprCtx extends Context.Tag("ExprCtx")<
  ExprCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    return {
        exprs: createObservableArrayWithLifetime<Expr>(new Subject<void>()),
    }
});

export const ExprCtxLive = Layer.effect(
  ExprCtx,
  ctxEffect
);

