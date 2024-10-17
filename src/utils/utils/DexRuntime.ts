import {
  Effect,
  Exit,
  Layer,
  Logger,
  LogLevel,
  ManagedRuntime,
  Scope,
} from "effect";
import { CanvasViewCtxLive } from "src/canvas/CanvasView";
import { CanvasComponentCtxLive } from "src/ctx/CanvasComponentCtx";
import { ComponentCtxLive } from "src/ctx/ComponentCtx";
import { GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import { LibraryCtxLive } from "src/ctx/LibraryCtx";
import { LibraryProjectCtxLive } from "src/ctx/LibraryProjectCtx";
import { MainCtxLive } from "src/ctx/MainCtx";
import { SystemExFuncCtxLive } from "src/ctx/SystemExFuncCtx";
import { TelemetryCtxLive } from "src/ctx/TelemetryCtx";
import { ViewCtxLive } from "src/ctx/ViewCtx";
import { EvaluatorCtxLive } from "src/evaluation/EvaluatorCtx";
import { GoBridgeCtxLive } from "src/evaluation/GoBridge";
import { CloneNumberTargetCtxLive } from "src/ex-object/CloneNumberTarget";
import { GlobalPropertyCtxLive } from "src/ex-object/GlobalProperty";
import { ProjectCtxLive } from "src/ex-object/Project";
import { ExObjectFocusCtxLive } from "src/focus/ExObjectFocusCtx";
import { Focus2CtxLive } from "src/focus/Focus2";
import { FocusCtxLive } from "src/focus/FocusCtx";
import { RehydratorCtxLive } from "src/hydration/Rehydrator";
import { EncodeCtxLive } from "src/utils/persistence/EncodeCtx";
import { GCloudPersistCtx00Live } from "src/utils/persistence/GCloudPersist00Ctx";
import { LibraryPersistCtxLive } from "src/utils/persistence/LibraryPersistCtx";
import { LoadCtxLive } from "src/utils/persistence/LoadCtx";
import { CommandCardCtxLive } from "src/utils/utils/CommandCard";
import { ExprCommandCtxLive } from "src/utils/utils/ExprSelect";
import { ComboboxCtxLive } from "src/utils/views/Combobox";
import { ComponentSelectCtxLive } from "src/utils/views/ComponentSelect";
import { onMount } from "svelte";
import { FocusViewCtxLive } from "../views/FocusView";
import { ComboboxFieldCtxLive } from "../views/ComboboxField";
import { ExObjectViewCtxLive } from "../views/ExObjectView";
import { PropertyViewCtxLive } from "../views/PropertyView";
import { ExprViewCtxLive } from "../views/ExprView";
import { RootExprViewCtxLive } from "../views/RootExprView";
import { BasicPropertyListCtxLive } from "../views/BasicPropertyList";
import { TextFieldCtxLive } from "../views/TextField";

const mainLayer = EvaluatorCtxLive.pipe(
  Layer.provideMerge(MainCtxLive),

  // View layer
  Layer.provideMerge(ExObjectViewCtxLive),
  Layer.provideMerge(BasicPropertyListCtxLive),
  Layer.provideMerge(PropertyViewCtxLive),
  Layer.provideMerge(RootExprViewCtxLive),
  Layer.provideMerge(ExprViewCtxLive),

  // Inputs
  Layer.provideMerge(TextFieldCtxLive),
  Layer.provideMerge(ComponentSelectCtxLive),

  Layer.provideMerge(GoBridgeCtxLive),
  Layer.provideMerge(GoModuleCtxLive),
  Layer.provideMerge(ExObjectFocusCtxLive),
  Layer.provideMerge(ComboboxFieldCtxLive),
  Layer.provideMerge(FocusViewCtxLive),

  Layer.provideMerge(ExprCommandCtxLive),

  Layer.provideMerge(LoadCtxLive),
  Layer.provideMerge(EncodeCtxLive),
  Layer.provideMerge(LibraryPersistCtxLive),
  Layer.provideMerge(GCloudPersistCtx00Live)
);

const mainLayer2 = ComponentCtxLive.pipe(
  Layer.provideMerge(Focus2CtxLive),
  Layer.provideMerge(ProjectCtxLive),
  Layer.provideMerge(LibraryProjectCtxLive),
  Layer.provideMerge(LibraryCtxLive),
  Layer.provideMerge(ViewCtxLive),
  Layer.provideMerge(CommandCardCtxLive),

  Layer.provideMerge(FocusCtxLive),
  Layer.provideMerge(RehydratorCtxLive),
  // Layer.provideMerge(TestTelemetryCtxLive),
  Layer.provideMerge(TelemetryCtxLive),
  Layer.provideMerge(CloneNumberTargetCtxLive),
  Layer.provideMerge(CanvasComponentCtxLive),
  Layer.provideMerge(ComboboxCtxLive),
  Layer.provideMerge(SystemExFuncCtxLive),
  Layer.provideMerge(GlobalPropertyCtxLive),
  Layer.provideMerge(CanvasViewCtxLive),
  Layer.provideMerge(Logger.minimumLogLevel(LogLevel.All))
);

const mainLayer3 = mainLayer.pipe(Layer.provideMerge(mainLayer2));

export const DexRuntime = ManagedRuntime.make(mainLayer3);

export function dexMakeSvelteScope(): Promise<Scope.Scope> {
  return new Promise((resolve) => {
    let scope: Scope.CloseableScope;
    onMount(() => {
      const v = Effect.gen(function* () {
        scope = yield* Scope.make();
        resolve(scope);
      });

      DexRuntime.runPromise(v);

      return () => {
        Effect.gen(function* () {
          yield* Scope.close(scope, Exit.succeed(undefined));
        }).pipe(DexRuntime.runPromise);
      };
    });
  });
}
