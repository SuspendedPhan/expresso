import { BehaviorSubject, Observable, take } from "rxjs";
import DebugOverlay from "./DebugOverlay";
import { Message } from "./Logger";


export default class GenericSelection {
    private selectedObject$ = new BehaviorSubject<Message | null>(null);

    public constructor(private debugOverlay: DebugOverlay) {}

    public select(object: Message | null) {
        this.selectedObject$.next(object);
    }

    public navDown() {
        this.debugOverlay.getFilteredMessages$().pipe(take(1)).subscribe(messages => {
            if (messages.length === 0) {
                return;
            }

            const current = this.selectedObject$.value;
            const currentIndex = current ? messages.indexOf(current) : -1;
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % messages.length;
            this.select(messages[nextIndex]);
        });
    }

    public navUp() {
    }

    public getSelected$(): Observable<Message | null> {
        return this.selectedObject$;
    }
}