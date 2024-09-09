import { Layer, ManagedRuntime } from "effect";
import { ExObjectCtxLive } from "src/ctx/ExObjectCtx";
import { ExprCtxLive } from "src/ctx/ExprCtx";
import { LibraryCtxLive } from "src/ctx/LibraryCtx";
import { ProjectCtxLive } from "src/ctx/ProjectCtx";
import { PropertyCtxLive } from "src/ctx/PropertyCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";

const mainLayer = Layer.merge(EvaluatorCtxLive, ProjectCtxLive).pipe(
  Layer.provideMerge(LibraryCtxLive),
  Layer.provideMerge(PropertyCtxLive),
  Layer.provideMerge(ExprCtxLive),
  Layer.provideMerge(ExObjectCtxLive)
);

export const DexRuntime = ManagedRuntime.make(mainLayer);
