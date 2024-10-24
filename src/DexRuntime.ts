import { Exit, Layer, Logger, LogLevel, Scope } from "effect";

import { Effect, ManagedRuntime } from "effect";
import type { AppState } from "./AppState";
import { AppStateCtx, AppStateCtxLive } from "./AppStateCtx";
import { FocusReducer } from "./DexFocus";
import { DexReducer } from "./DexReducer";
import { onMount } from "svelte";

const layer = AppStateCtxLive.pipe(Layer.provideMerge(Logger.minimumLogLevel(LogLevel.All)));

export const DexRuntime = ManagedRuntime.make(layer);

document.addEventListener("keydown", (e) => {
  if (e.key !== "e") {
    return;
  }

  dexRunReducer(FocusReducer.tryStartEditing());
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") {
    return;
  }

  dexRunReducer(FocusReducer.tryCancelEdit());
});

document.addEventListener("click", () => {
  dexRunReducer(FocusReducer.setFocusNone());
});

export function dexRunReducer(reducer: DexReducer.DexReducer<AppState>) {
  Effect.gen(function* () {
    yield* AppStateCtx.runReducer(reducer);
  }).pipe(DexRuntime.runPromise);
}

export function dexMakeSvelteScope(): Promise<Scope.Scope> {
  return new Promise((resolve) => {
    let scope: Scope.CloseableScope;
    onMount(() => {
      const v = Effect.gen(function* () {
        scope = yield* Scope.make();
        resolve(scope);
      });

      DexRuntime.runPromise(v);

      return () => {
        Effect.gen(function* () {
          yield* Scope.close(scope, Exit.succeed(undefined));
        }).pipe(DexRuntime.runPromise);
      };
    });
  });
}