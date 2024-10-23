import { Layer, Logger, LogLevel } from "effect";

import { Effect, ManagedRuntime } from "effect";
import type { AppState } from "./AppState";
import { AppStateCtx, AppStateCtxLive } from "./AppStateCtx";
import { FocusReducer } from "./DexFocus";
import { DexReducer } from "./DexReducer";

const layer = AppStateCtxLive.pipe(Layer.provideMerge(Logger.minimumLogLevel(LogLevel.All)));

export const DexRuntime = ManagedRuntime.make(layer);

document.addEventListener("keydown", (e) => {
  if (e.key !== "e") {
    return;
  }

  DexRuntime_RunReducer(FocusReducer.tryStartEditing());
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") {
    return;
  }

  DexRuntime_RunReducer(FocusReducer.tryCancelEdit());
});

document.addEventListener("click", () => {
  DexRuntime_RunReducer(FocusReducer.setFocusNone());
});

export function DexRuntime_RunReducer(reducer: DexReducer.DexReducer<AppState>) {
  Effect.gen(function* () {
    yield* AppStateCtx.runReducer(reducer);
  }).pipe(DexRuntime.runPromise);
}
