import DebugOverlay from "./DebugOverlay";
import DebugOverlaySelection from "./DebugOverlaySelection";

export default class DebugOverlayContext {
    public selection: DebugOverlaySelection;

    public constructor(public debugOverlay: DebugOverlay) {
        this.selection = new DebugOverlaySelection(debugOverlay);
    }
}