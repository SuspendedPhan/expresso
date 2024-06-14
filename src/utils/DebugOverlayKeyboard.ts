import hotkeys from "hotkeys-js";
import DebugOverlay from "./DebugOverlay";
import Keyboard from "./Keyboard";

export default class DebugOverlayKeyboard {
    public static SCOPE = "DebugOverlay";
    
    public static register(debugOverlay: DebugOverlay, input: HTMLInputElement) {
        hotkeys("cmd+/", "all", function (_event, _handler) {
            debugOverlay.toggleActive();
        });

        hotkeys("/", this.SCOPE, function (event, _handler) {
            input.focus();
            event.preventDefault();
        });

        debugOverlay.isActive$().subscribe((active) => {
            if (active) {
                hotkeys.setScope(this.SCOPE);
            } else {
                hotkeys.setScope(Keyboard.SCOPE);
            }
        });
    }
}