import { concat, of, Subject } from "rxjs";
import type { OBS } from "src/utils/utils/Utils";

export type ItemChange<T> = ItemAdded<T> | InitialSubscription;

export interface ItemAdded<T> {
    readonly type: "ItemAdded";
    readonly item: T;
    readonly index: number;
}

export interface InitialSubscription {
    readonly type: "InitialSubscription";
}

export interface ArrayEvent<T> {
    readonly items: readonly T[];
    readonly change: ItemChange<T>;
}

export default class ObservableArray<T> {
    private items: T[] = [];
    private onChange$_ = new Subject<ArrayEvent<T>>();

    public push(value: T): void {
        this.items.push(value);
        const change: ItemAdded<T> = { type: "ItemAdded", item: value, index: this.items.length - 1};
        this.onChange$_.next({items: this.items, change: change});
    }

    public onChange$(): OBS<ArrayEvent<T>> {
        const initial: InitialSubscription = { type: "InitialSubscription" };
        const event: ArrayEvent<T> = { items: this.items, change: initial };
        return concat(of(event), this.onChange$_);
    }
}
