import { Effect, Layer } from "effect";
import type GoModule from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("GoModuleCtx.ts");

export class GoModuleCtx extends Effect.Tag("GoModuleCtx")<
  GoModuleCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

declare var window: any;

// Defined in public/wasm_exec.js
declare var Go: any;

const ctxEffect = Effect.gen(function* () {
  const goModule_ = Effect.cached(
    Effect.gen(function* () {
      log55.debug("Loading Go module");
      const go = new Go();

      log55.debug("Fetching wasm module");
      const result = yield* Effect.promise(() =>
        WebAssembly.instantiateStreaming(
          fetch("mymodule.wasm"),
          go.importObject
        )
      );

      log55.debug("Running Go module");
      go.run(result.instance);
      const goModule: GoModule = window.GoModule;
      (goModule as any).hello();
      return goModule;
    })
  );

  return {
    get goModule() {
      return Effect.gen(function* () {
        log55.debug("goModule()");
        const vv = yield* goModule_;
        const vv2 = yield* vv;
        log55.debug("goModule() done");
        return vv2;
      });
    }
  };
});

export const GoModuleCtxLive = Layer.effect(GoModuleCtx, ctxEffect);
