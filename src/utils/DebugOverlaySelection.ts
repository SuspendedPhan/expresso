import { BehaviorSubject, Observable } from "rxjs";

export interface Selectable {}

export default class DebugOverlaySelection {
    private selectedObject$ = new BehaviorSubject<Selectable | null>(null);

    public select(object: Selectable | null) {
        this.selectedObject$.next(object);
    }

    public navDown() {
        if (this.selectedObject$.value === null) {
            return;
        }
    }

    public navUp() {
    }

    public getSelected$(): Observable<Selectable | null> {
        return this.selectedObject$;
    }
}