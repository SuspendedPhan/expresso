import { Context, Effect, Layer } from "effect";
import { Subject } from "rxjs";
import type { Property } from "src/ex-object/Property";
import { createObservableArrayWithLifetime } from "src/utils/utils/ObservableArray";

export class PropertyCtx extends Context.Tag("PropertyCtx")<
  PropertyCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    return {
        properties: createObservableArrayWithLifetime<Property>(new Subject<void>()),
    }
});

export const PropertyCtxLive = Layer.effect(
  PropertyCtx,
  ctxEffect
);

