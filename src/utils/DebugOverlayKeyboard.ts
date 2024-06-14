import hotkeys from "hotkeys-js";
import DebugOverlay from "./DebugOverlay";

export default class DebugOverlayKeyboard {
    public static SCOPE = "DebugOverlay";
    
    public static register(debugOverlay: DebugOverlay) {
        hotkeys("/,cmd+/", "all", function (_event, _handler) {
            debugOverlay.toggleActive();
        });
    }
}