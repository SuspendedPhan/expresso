import { ManagedRuntime } from "effect";
import { AppStateCtxLive } from "./AppStateCtx";

export const DexRuntime = ManagedRuntime.make(AppStateCtxLive);
