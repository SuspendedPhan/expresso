import { BehaviorSubject, Observable, take } from "rxjs";
import DebugOverlay, { FormattedMessage } from "./DebugOverlay";
import { Message } from "./Logger";


export default class GenericSelection {
    private selectedObject$ = new BehaviorSubject<FormattedMessage | null>(null);

    public constructor(private debugOverlay: DebugOverlay) {}

    public select(object: FormattedMessage | null) {
        this.selectedObject$.next(object);
    }

    public navDown() {
        this.debugOverlay.getFilteredMessages$().pipe(take(1)).subscribe(messages => {
            if (messages.length === 0) {
                return;
            }

            const current = this.selectedObject$.value;
            if (current === null) {
                this.selectedObject$.next(messages[0]);
                return;
            }

            const currentIndex = messages.indexOf(current);
            if (currentIndex === -1) {
                console.error("Current message not found in messages");
                this.selectedObject$.next(messages[0]);
                return;
            }

            const nextIndex = currentIndex + 1;
            if (nextIndex >= messages.length) {
                return;
            }

            this.selectedObject$.next(messages[nextIndex]);
        });
    }

    public navUp() {
        
    }

    public getSelected$(): Observable<FormattedMessage | null> {
        return this.selectedObject$;
    }
}