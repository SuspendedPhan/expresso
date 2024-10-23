import { Layer, Logger, LogLevel, Option } from "effect";

import { Effect, ManagedRuntime } from "effect";
import { AppStateCtx, AppStateCtxLive } from "./AppStateCtx";
import { DexReducer } from "./DexReducer";

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
    if (focus.isEditing) {
      return;
    }

    yield* AppStateCtx.applyAppStateReducer(DexReducer.AppState.setEditing(true));
  }).pipe(DexRuntime.runPromise);
});
