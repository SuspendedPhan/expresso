import { Layer, ManagedRuntime } from "effect";
import { ProjectCtxLive } from "src/ctx/ProjectCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";

const mainLayer = Layer.merge(EvaluatorCtxLive, ProjectCtxLive);

export const DexRuntime = ManagedRuntime.make(mainLayer);
