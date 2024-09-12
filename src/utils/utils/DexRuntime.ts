import { Layer, ManagedRuntime } from "effect";
import { ExObjectCtxLive } from "src/ctx/ExObjectCtx";
import { ExprCtxLive } from "src/ctx/ExprCtx";
import { KeyboardCtxLive } from "src/ctx/KeyboardCtx";
import { LibraryCtxLive } from "src/ctx/LibraryCtx";
import { MainCtxLive } from "src/ctx/MainCtx";
import { ProjectCtxLive } from "src/ctx/ProjectCtx";
import { PropertyCtxLive } from "src/ctx/PropertyCtx";
import { ViewCtxLive } from "src/ctx/ViewCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";
import { ExObjectFocusCtxLive } from "src/focus/ExObjectFocusCtx";
import { ExprFocusCtxLive } from "src/focus/ExprFocus";
import { FocusCtxLive } from "src/focus/FocusCtx";
import { CommandCardCtxLive } from "src/utils/utils/CommandCard";
import { ExprCommandCtxLive } from "src/utils/utils/ExprCommand";

const mainLayer = Layer.merge(EvaluatorCtxLive, ProjectCtxLive).pipe(
  Layer.provideMerge(MainCtxLive),
  Layer.provideMerge(ExObjectFocusCtxLive),
  Layer.provideMerge(ExprFocusCtxLive),
  Layer.provideMerge(KeyboardCtxLive),
  Layer.provideMerge(FocusCtxLive),
  
  Layer.provideMerge(ExprCommandCtxLive),
  Layer.provideMerge(LibraryCtxLive),
  Layer.provideMerge(PropertyCtxLive),
  Layer.provideMerge(ExObjectCtxLive),
  Layer.provideMerge(ExprCtxLive),
  Layer.provideMerge(ViewCtxLive),
  Layer.provideMerge(ExObjectCtxLive),
  Layer.provideMerge(CommandCardCtxLive),
);

export const DexRuntime = ManagedRuntime.make(mainLayer);
