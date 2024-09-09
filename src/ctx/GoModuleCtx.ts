import { Effect, Layer } from "effect";
import type GoModule from "src/utils/utils/GoModule";

export class GoModuleCtx extends Effect.Tag("GoModuleCtx")<
  GoModuleCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

declare var window: any;

// Defined in public/wasm_exec.js
declare var Go: any;

const ctxEffect = Effect.gen(function* () {
  return {
    goModule: yield* Effect.cached(
      Effect.gen(function* () {
        const go = new Go();
        const result = yield* Effect.promise(() =>
          WebAssembly.instantiateStreaming(
            fetch("mymodule.wasm"),
            go.importObject
          )
        );
        go.run(result.instance);
        const goModule: GoModule = window.GoModule;
        (goModule as any).hello();
        return goModule;
      })
    ),
  };
});

export const GoModuleCtxLive = Layer.effect(GoModuleCtx, ctxEffect);
