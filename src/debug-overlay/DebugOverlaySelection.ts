import { Observable } from "rxjs";
import DebugOverlay, { FormattedMessage } from "./DebugOverlay";
import ArrayNavigator from "./ArrayNavigator";


export default class DebugOverlaySelection {
    private navigator: ArrayNavigator<FormattedMessage>;

    public constructor(debugOverlay: DebugOverlay) {
        this.navigator = new ArrayNavigator(debugOverlay.getFilteredMessages$(), (a, b) => a.message.id === b.message.id);
    }

    public select(object: FormattedMessage | null) {
        this.navigator.setCurrent(object);
    }

    public navDown() {
        this.navigator.goRight();
    }

    public navUp() {
        this.navigator.goLeft();
    }

    public getSelected$(): Observable<FormattedMessage | null> {
        return this.navigator.getCurrent$();
    }
}