import { Effect, Layer, PubSub } from "effect";
import type { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import type { Property } from "src/ex-object/Property";

export class EventBusCtx extends Effect.Tag("EventBusCtx")<
  EventBusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    exObjectAdded: yield* PubSub.unbounded<ExObject>(),
    propertyAdded: yield* PubSub.unbounded<Property>(),
    exprAdded: yield* PubSub.unbounded<Expr>(),
  };
});

export const EventBusCtxLive = Layer.effect(EventBusCtx, ctxEffect);