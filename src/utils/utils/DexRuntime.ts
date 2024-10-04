import { Layer, ManagedRuntime } from "effect";
import { CanvasComponentCtxLive } from "src/ctx/CanvasComponentCtx";
import { ComponentCtxLive } from "src/ctx/ComponentCtx";
import { EventBusCtxLive } from "src/ctx/EventBusCtx";
import { GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import { KeyboardCtxLive } from "src/ctx/KeyboardCtx";
import { LibraryCtxLive } from "src/ctx/LibraryCtx";
import { LibraryProjectCtxLive } from "src/ctx/LibraryProjectCtx";
import { MainCtxLive } from "src/ctx/MainCtx";
import { ProjectNameCtxLive } from "src/ctx/ProjectNameCtx";
import { TelemetryCtxLive } from "src/ctx/TelemetryCtx";
import { ViewCtxLive } from "src/ctx/ViewCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";
import { GoBridgeCtxLive } from "src/evaluation/GoBridge";
import { CloneNumberTargetCtxLive } from "src/ex-object/CloneNumberTarget";
import { ExObjectFocusCtxLive } from "src/focus/ExObjectFocusCtx";
import { ExprFocusCtxLive } from "src/focus/ExprFocus";
import { FocusCtxLive } from "src/focus/FocusCtx";
import { RehydratorCtxLive } from "src/hydration/Rehydrator";
import { EncodeCtxLive } from "src/utils/persistence/EncodeCtx";
import { GCloudPersistCtx00Live } from "src/utils/persistence/GCloudPersist00Ctx";
import { LibraryPersistCtxLive } from "src/utils/persistence/LibraryPersistCtx";
import { LoadCtxLive } from "src/utils/persistence/LoadCtx";
import { CommandCardCtxLive } from "src/utils/utils/CommandCard";
import { ExprCommandCtxLive } from "src/utils/utils/ExprCommand";

const mainLayer = EvaluatorCtxLive.pipe(
  Layer.provideMerge(MainCtxLive),
  Layer.provideMerge(GoBridgeCtxLive),
  Layer.provideMerge(GoModuleCtxLive),
  Layer.provideMerge(ExObjectFocusCtxLive),
  Layer.provideMerge(ExprFocusCtxLive),
  Layer.provideMerge(KeyboardCtxLive),

  Layer.provideMerge(ExprCommandCtxLive),

  Layer.provideMerge(LoadCtxLive),
  Layer.provideMerge(EncodeCtxLive),
  Layer.provideMerge(LibraryPersistCtxLive),
  Layer.provideMerge(GCloudPersistCtx00Live),

  Layer.provideMerge(EventBusCtxLive),
  Layer.provideMerge(LibraryProjectCtxLive),
  Layer.provideMerge(LibraryCtxLive),
  Layer.provideMerge(ViewCtxLive),
  Layer.provideMerge(CommandCardCtxLive),
  Layer.provideMerge(FocusCtxLive)
);

const mainLayer2 = mainLayer.pipe(
  Layer.provideMerge(ComponentCtxLive),
  Layer.provideMerge(RehydratorCtxLive),
  Layer.provideMerge(ProjectNameCtxLive),
  // Layer.provideMerge(TestTelemetryCtxLive),
  Layer.provideMerge(TelemetryCtxLive),
  Layer.provideMerge(CloneNumberTargetCtxLive),
  Layer.provideMerge(CanvasComponentCtxLive),
);

export const DexRuntime = ManagedRuntime.make(mainLayer2);
