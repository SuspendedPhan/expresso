import { BehaviorSubject, Observable } from "rxjs";

export default class DebugOverlay {
    private active = new BehaviorSubject<boolean>(false);

    public isActive$() : Observable<boolean> {
        return this.active;
    }

    public toggleActive() {
        this.active.next(!this.active.value);
    }
}