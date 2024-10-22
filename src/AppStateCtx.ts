import { Effect, Layer, Option, Ref } from "effect";
import { ProjectEditorHome, type AppState } from "./AppState";
import assert from "assert-ts";
import { produce } from "immer";
import type { DexObject } from "./Domain";

export class AppStateCtx extends Effect.Tag("AppStateCtx")<AppStateCtx, Effect.Effect.Success<typeof ctxEffect>>() {}

const ctxEffect = Effect.gen(function* () {
  const appState = yield* Ref.make<AppState>({
    activeWindow: ProjectEditorHome({ dexObjects: [] }),
    focus: Option.none(),
  });

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
    addRootDexObject,
  };
});

export const AppStateCtxLive = Layer.effect(AppStateCtx, ctxEffect);
