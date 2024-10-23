import { ManagedRuntime } from "effect";
import { AppStateCtxLive } from "./AppStateCtx";

export function initDexRuntime() {
    return ManagedRuntime.make(AppStateCtxLive);
}