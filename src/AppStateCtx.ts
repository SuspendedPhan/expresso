import { Effect, Layer, Ref, Stream, SubscriptionRef } from "effect";
import { create } from "mutative";
import { writable } from "svelte/store";
import { makeAppState, ProjectEditorHome, type AppState } from "./AppState";
import { DexReducer } from "./DexReducer";

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
        appStateReadable.set(state);
      })
    ),
    Effect.forkDaemon
  );

  const appStateReadable = writable(yield* appState.get);

  const applyAppStateReducer = (fn: DexReducer.DexReducer<AppState>) =>
    Effect.gen(function* () {
      const state = yield* appState.get;
      const nextState = create(state, fn, { mark: () => "immutable" });
      yield* Ref.set(appState, nextState);
    });

  return {
    getAppStateReadable: appStateReadable,

    getAppState: appState.get,

    runReducer: applyAppStateReducer,
    applyAppStateReducer,

    getTextFieldOnInput: (makeReducerFromSetter: (value: string) => DexReducer.DexReducer<AppState>) => {
      return (event: Event) => {
        return Effect.gen(function* () {
          const value = (event.target as HTMLInputElement).value;
          const reducer = makeReducerFromSetter(value);
          yield* applyAppStateReducer(reducer);
        });
      };
    },
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
