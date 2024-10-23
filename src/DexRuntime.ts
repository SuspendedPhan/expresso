import { Layer, Logger, LogLevel, Option } from "effect";

import { Effect, ManagedRuntime } from "effect";
import { AppStateCtx, AppStateCtxLive } from "./AppStateCtx";
import { DexReducer } from "./DexReducer";
import type { AppState } from "./AppState";
import { FocusReducer } from "./DexFocus";

const layer = AppStateCtxLive.pipe(Layer.provideMerge(Logger.minimumLogLevel(LogLevel.All)));

export const DexRuntime = ManagedRuntime.make(layer);

document.addEventListener("keydown", (e) => {
  Effect.gen(function* () {
    if (e.key !== "e") {
      return;
    }

    const state = yield* AppStateCtx.getAppState;
    if (Option.isNone(state.focus)) {
      return;
    }

    const focus = state.focus.value;
    if (focus.editingState._tag !== "NotEditing") {
      return;
    }

    yield* AppStateCtx.applyAppStateReducer(DexReducer.AppState.startEditing());
  }).pipe(DexRuntime.runPromise);
});

document.addEventListener("click", () => {
  DexRuntime_RunReducer(FocusReducer.setFocusNone());
});


export function DexRuntime_RunReducer(reducer: DexReducer.DexReducer<AppState>) {
  Effect.gen(function* () {
    yield* AppStateCtx.runReducer(reducer);
  }).pipe(DexRuntime.runPromise);
}