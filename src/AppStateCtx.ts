import assert from "assert-ts";
import { Effect, Layer, Option, Ref, Stream, SubscriptionRef } from "effect";
import { produce } from "immer";
import { writable } from "svelte/store";
import { makeAppState, ProjectEditorHome, type AppState } from "./AppState";
import { type DexProject } from "./DexDomain";
import type { DexReducer } from "./DexReducer";

export class AppStateCtx extends Effect.Tag("AppStateCtx")<AppStateCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const appState = yield* SubscriptionRef.make<AppState>(
    makeAppState({
      activeWindow: ProjectEditorHome(),
    })
  );

  yield* appState.changes.pipe(
    Stream.runForEach((state) =>
      Effect.gen(function* () {
        console.log(state);
        appStateReadable.set(state);
      })
    ),
    Effect.forkDaemon
  );

  const appStateReadable = writable(yield* appState.get);

  return {
    getAppStateReadable: appStateReadable,

    getAppState: appState.get,

    applyProjectReducer(fn: DexReducer.DexReducer<DexProject>) {
      return Effect.gen(function* () {
        const state = yield* appState.get;
        const nextState = produce(state, (draft) => {
          const activeWindow = draft.activeWindow;
          assert(activeWindow._tag === "ProjectEditorHome", "Not in project editor");
          const dexProjectId = draft.activeProjectId;
          assert(Option.isSome(dexProjectId), "No project selected");
          const project = draft.projects.find((p) => p.id === dexProjectId.value);
          assert(project !== undefined, "Project not found");
          fn(project);
        });
        yield* Ref.set(appState, nextState);
      });
    },

    applyAppStateReducer(fn: DexReducer.DexReducer<AppState>) {
      return Effect.gen(function* () {
        const nextState = produce(yield* appState.get, fn);
        yield* Ref.set(appState, nextState);
      });
    },
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
