import assert from "assert-ts";
import { Effect, Layer, Option, Ref, Stream, SubscriptionRef } from "effect";
import { produce } from "immer";
import { writable } from "svelte/store";
import { ProjectEditorHome, type AppState } from "./AppState";
import type { DexReducer } from "./DexReducer";
import { makeDexProject, type DexProject } from "./Domain";

export class AppStateCtx extends Effect.Tag("AppStateCtx")<AppStateCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const appState = yield* SubscriptionRef.make<AppState>({
    activeWindow: ProjectEditorHome({ dexProject: makeDexProject({}) }),
    focus: Option.none(),
  });

  yield* appState.changes.pipe(
    Stream.runForEach((state) =>
      Effect.gen(function* () {
        appStateReadable.set(state);
      })
    ),
    Effect.forkDaemon
  );

  const appStateReadable = writable(yield* appState.get);

  return {
    getState: appStateReadable,

    applyProjectReducer(fn: DexReducer.DexReducer<DexProject>) {
      return Effect.gen(function* () {
        const state = yield* appState.get;
        const nextState = produce(state, (draft) => {
          assert(draft.activeWindow._tag === "ProjectEditorHome");
          fn(draft.activeWindow.dexProject);
        });
        yield* Ref.set(appState, nextState);
      });
    },

    applyAppStateReducer(fn: DexReducer.DexReducer<AppState>) {
      return Effect.gen(function* () {
        const nextState = produce(yield* appState.get, fn);
        yield* Ref.set(appState, nextState);
      });
    }
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
