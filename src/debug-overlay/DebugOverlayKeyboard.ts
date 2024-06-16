import hotkeys from "hotkeys-js";
import Keyboard from "../utils/Keyboard";
import DebugOverlayContext from "./DebugOverlayContext";
import LoggerConfig from "../utils/LoggerConfig";
import { take } from "rxjs";

export default class DebugOverlayKeyboard {
    public static SCOPE = "DebugOverlay";
    
    public static register(ctx: DebugOverlayContext, input: HTMLInputElement) {
        const debugOverlay = ctx.debugOverlay;

        hotkeys("cmd+/", "all", function (_event, _handler) {
            debugOverlay.toggleActive();
        });

        hotkeys("/", this.SCOPE, function (event, _handler) {
            input.focus();
            event.preventDefault();
        });

        hotkeys("j", this.SCOPE, function (_event, _handler) {
            ctx.selection.navDown();
        });

        hotkeys("k", this.SCOPE, function (_event, _handler) {
            ctx.selection.navUp();
        });

        hotkeys("m", this.SCOPE, function (_event, _handler) {
            ctx.selection.getSelected$().pipe(take(1)).subscribe((selected) => {
                if (selected !== null) {
                    LoggerConfig.get().muteTopic(selected.message.topic);
                }
            });
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