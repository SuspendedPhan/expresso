import { BehaviorSubject, Observable, Subject } from "rxjs";
import DebugOverlayUtils from "./DebugOverlayUtils";

export default class DebugOverlay {
    private active = new BehaviorSubject<boolean>(false);
    private query = new BehaviorSubject<string>("");

    public isActive$() : Observable<boolean> {
        return this.active;
    }

    public toggleActive() {
        this.active.next(!this.active.value);
    }

    public getFilteredMessages$() {
        return DebugOverlayUtils.getFilteredMessages$(this.query);
    }

    public getQuery$(): Observable<string> {
        return this.query;
    }

    public setQuery(query: string) {
        this.query.next(query);
    }
}