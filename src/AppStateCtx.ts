import assert from "assert-ts";
import { Effect, Layer, Option, Ref, Stream, SubscriptionRef } from "effect";
import { create } from "mutative";
import { writable } from "svelte/store";
import { makeAppState, ProjectEditorHome, type AppState } from "./AppState";
import { type DexProject } from "./DexDomain";
import type { DexReducer } from "./DexReducer";
import { DexRuntime } from "./DexRuntime";

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

  const makeReducerApplier = (reducer: DexReducer.DexReducer<AppState>) => {
    return () => {
      Effect.gen(function* () {
        yield* applyAppStateReducer(reducer);
      }).pipe(DexRuntime.runPromise);
    };
  };

  const applyAppStateReducer = (fn: DexReducer.DexReducer<AppState>) =>
    Effect.gen(function* () {
      const nextState = create(yield* appState.get, fn, { mark: () => "immutable" });
      yield* Ref.set(appState, nextState);
    });

  return {
    getAppStateReadable: appStateReadable,

    getAppState: appState.get,
    makeReducerApplier,

    applyProjectReducer(fn: DexReducer.DexReducer<DexProject>) {
      return Effect.gen(function* () {
        const state = yield* appState.get;
        const nextState = create(
          state,
          (draft) => {
            const activeWindow = draft.activeWindow;
            assert(activeWindow._tag === "ProjectEditorHome", "Not in project editor");
            const dexProjectId = draft.activeProjectId;
            assert(Option.isSome(dexProjectId), "No project selected");
            const project = draft.projects.find((p) => p.id === dexProjectId.value);
            assert(project !== undefined, "Project not found");
            fn(project);
          },
          { mark: () => "immutable" }
        );
        yield* Ref.set(appState, nextState);
      });
    },

    applyAppStateReducer,

    getTextFieldOnInput: (makeReducerFromSetter: (value: string) => DexReducer.DexReducer<AppState>) => {
      return (event: Event) => {
        Effect.gen(function* () {
          const value = (event.target as HTMLInputElement).value;
          const reducer = makeReducerFromSetter(value);
          yield* applyAppStateReducer(reducer);
        }).pipe(DexRuntime.runPromise);
      };
    },
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
