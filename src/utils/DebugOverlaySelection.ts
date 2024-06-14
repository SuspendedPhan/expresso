import { BehaviorSubject, Observable } from "rxjs";

export interface Selectable {}

export default class DebugOverlaySelection {
    private selectedObject$ = new BehaviorSubject<Selectable | null>(null);

    public select(object: Selectable | null) {
        this.selectedObject$.next(object);
    }

    public getSelected$(): Observable<Selectable | null> {
        return this.selectedObject$;
    }
}