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

    public map<U>(fn: (value: T) => U): ObservableArray<U> {
        const result = new ObservableArray<U>();
        this.onChange$().subscribe((event) => {
            switch (event.change.type) {
                case "InitialSubscription":
                    const items = event.items.map(fn);
                    items.forEach((item) => result.push(item));
                    break;
                case "ItemAdded":
                    result.push(fn(event.change.item));
                    break;
            }
        });
        return result;
    }
}
