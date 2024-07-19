import { BehaviorSubject, type Observable } from "rxjs";

export type ItemChange<T> = ItemAdded<T> | null;

export interface ItemAdded<T> {
    readonly type: "added";
    readonly item: T;
    readonly index: number;
}

export interface ArrayChange<T> {
    readonly items: readonly T[];
    readonly changed: ItemChange<T>;
}

export default class ObservableArray<T> {
    private items: T[] = [];
    private lastChange: ItemChange<T> = null;
    private items$ = new BehaviorSubject<ArrayChange<T>>({items: this.items, changed: this.lastChange});

    public push(value: T): void {
        this.items.push(value);
        this.lastChange = { type: "added", item: value, index: this.items.length - 1};
        this.items$.next({items: this.items, changed: this.lastChange});
    }
    
    public onChange$(): Observable<ArrayChange<T>> {
        return this.items$;
    }
}
