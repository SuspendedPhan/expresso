import { Context, Effect, Layer } from "effect";

export class GoModuleCtx extends Context.Tag("GoModuleCtx")<
  GoModuleCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

declare var window: any;

// Defined in public/wasm_exec.js
declare var Go: any;

const ctxEffect = Effect.gen(function* () {
  return {
    goModule: Effect.cached(
      Effect.gen(function* () {
        const go = new Go();
        const result = yield* Effect.promise(() =>
          WebAssembly.instantiateStreaming(
            fetch("mymodule.wasm"),
            go.importObject
          )
        );
        go.run(result.instance);
        const goModule = window.GoModule;
        goModule.hello();
        return goModule;
      })
    ),
  };
});

export const GoModuleCtxLive = Layer.effect(GoModuleCtx, ctxEffect);
