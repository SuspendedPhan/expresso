import { Layer, ManagedRuntime } from "effect";
import { ExObjectCtxLive } from "src/ctx/ExObjectCtx";
import { ExprCtxLive } from "src/ctx/ExprCtx";
import { LibraryCtxLive } from "src/ctx/LibraryCtx";
import { ProjectCtxLive } from "src/ctx/ProjectCtx";
import { PropertyCtxLive } from "src/ctx/PropertyCtx";
import { ViewCtxLive } from "src/ctx/ViewCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";
import { FocusCtxLive } from "src/focus/FocusCtx";
import { ExprCommandCtxLive } from "src/utils/utils/ExprCommand";

const mainLayer = Layer.merge(EvaluatorCtxLive, ProjectCtxLive).pipe(
  Layer.provideMerge(LibraryCtxLive),
  Layer.provideMerge(PropertyCtxLive),
  Layer.provideMerge(ExprCtxLive),
  Layer.provideMerge(ExObjectCtxLive),
  Layer.provideMerge(ExprCommandCtxLive),
  Layer.provideMerge(ViewCtxLive),
  Layer.provideMerge(FocusCtxLive)
);

export const DexRuntime = ManagedRuntime.make(mainLayer);
