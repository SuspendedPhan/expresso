import { Effect, Layer, Option, Ref, Stream, SubscriptionRef } from "effect";
import { ProjectEditorHome, type AppState } from "./AppState";
import assert from "assert-ts";
import { produce } from "immer";
import type { DexObject } from "./Domain";
import { writable } from "svelte/store";

export class AppStateCtx extends Effect.Tag("AppStateCtx")<AppStateCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const appState = yield* SubscriptionRef.make<AppState>({
    activeWindow: ProjectEditorHome({ dexObjects: [] }),
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

  let counter = 0;

  const addRootDexObject = () =>
    Effect.gen(function* () {
      const state = yield* appState.get;
      assert(state.activeWindow._tag === "ProjectEditorHome");
      counter++;
      const newDexObject: DexObject = {
        _tag: "DexObject",
        name: `Object ${counter}`,
        children: [],
      };
      const nextState = produce(state, (draft) => {
        assert(draft.activeWindow._tag === "ProjectEditorHome");
        draft.activeWindow.dexObjects.push(newDexObject);
      });
      yield* Ref.set(appState, nextState);
    });

  return {
    getState: appStateReadable,
    addRootDexObject,
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
