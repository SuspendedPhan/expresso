import { BehaviorSubject, Observable, take } from "rxjs";
import DebugOverlay, { FormattedMessage } from "./DebugOverlay";
import ArrayNavigator from "./ArrayNavigator";


export default class DebugOverlaySelection {
    private selectedObject$ = new BehaviorSubject<FormattedMessage | null>(null);
    private navigator: ArrayNavigator<FormattedMessage>;

    public constructor(debugOverlay: DebugOverlay) {
        this.navigator = new ArrayNavigator(debugOverlay.getFilteredMessages$(), (a, b) => a.message.id === b.message.id);
    }

    public select(object: FormattedMessage | null) {
        this.selectedObject$.next(object);
    }

    public navDown() {
        this.navigator.goRight();
    }

    public navUp() {
        this.navigator.goLeft();
    }

    public getSelected$(): Observable<FormattedMessage | null> {
        return this.selectedObject$;
    }
}