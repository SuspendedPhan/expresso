import ArrayNavigator from "./ArrayNavigator";
import DebugOverlay, { FormattedMessage } from "./DebugOverlay";

export default class DebugOverlayContext {
    public readonly selection: ArrayNavigator<FormattedMessage>;

    public constructor(public debugOverlay: DebugOverlay) {
        this.selection = new ArrayNavigator(debugOverlay.getFilteredMessages$(), (a, b) => a.message.id === b.message.id);
    }
}