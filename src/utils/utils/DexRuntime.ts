import { Console, Effect, Layer, ManagedRuntime } from "effect";

class MainCtx extends Effect.Tag("MainCtx")<
  MainCtx,
  { readonly notify: (message: string) => Effect.Effect<void> }
>() {
}

export const DexRuntime = ManagedRuntime.make(Layer.succeed());