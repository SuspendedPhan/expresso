import assert from "assert-ts";
import { ResizeSensor } from "css-element-queries";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  partition,
  pipe,
  Subject,
} from "rxjs";
import { log5 } from "src/utils/utils/Log5";
import { onMount } from "svelte";

const log55 = log5("Utils.ts");

export type OBS<T> = Observable<T>;
export type SUB<T> = Subject<T>;
export type BSUB<T> = BehaviorSubject<T>;
export type BSUB$$<T> = BehaviorSubject<Observable<T>>;

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}

export function createSubjectWithLifetime<T>(
  complete$: Observable<void>
): Subject<T> {
  const subject = new Subject<T>();
  complete$.subscribe({
    complete: () => {
      subject.complete();
    },
  });
  return subject;
}

export function createBehaviorSubjectWithLifetime<T>(
  complete$: Observable<void>,
  initialValue: T
): BehaviorSubject<T> {
  const subject = new BehaviorSubject<T>(initialValue);
  complete$.subscribe({
    complete: () => {
      subject.complete();
    },
  });
  return subject;
}

export interface Destroyable {
  destroy$: SUB<void>;
}

export namespace ArrayFns {
  export function getFromBack<T>(arr: T[], index: number): T | undefined {
    return arr[arr.length - 1 - index];
  }

  export function getWrapped<T>(arr: T[], index: number): T {
    if (index < 0) {
      const val = arr[arr.length + index];
      assert(val !== undefined);
      return val;
    }

    if (index >= arr.length) {
      const val = arr[index % arr.length];
      assert(val !== undefined);
      return val;
    }

    const val = arr[index];
    assert(val !== undefined);
    return val;
  }

  export function getWrappedIndex<T>(arr: T[], index: number): number {
    if (index < 0) {
      log55.log3(9, "getWrappedIndex1", index, arr.length);
      return arr.length + index;
    }

    if (index >= arr.length) {
      log55.log3(9, "getWrappedIndex2", index, arr.length);
      return index % arr.length;
    }

    log55.log3(9, "getWrappedIndex3", index, arr.length);
    return index;
  }
}

export function rxEquals<T>(obj: T) {
  return pipe(
    map((other: T | false) => {
      return obj === other;
    })
  );
}

export function partitionFirst<T>(observable: OBS<T>): [OBS<T>, OBS<T>] {
  return partition(observable, (_, index) => index === 0);
}

export namespace RxFns {
  export function getOrFalse<T>(predicate: (obj: T) => boolean) {
    return pipe(
      map((obj: T | false) => {
        if (obj === false) {
          return false;
        }
        return predicate(obj) ? obj : false;
      })
    );
  }

  export function getOrFalsePred<T, T2 extends T>(predicate: (obj: T) => obj is T2) {
    return pipe(
      map((obj: T | false) => {
        if (obj === false) {
          return false;
        }
        return predicate(obj) ? obj : false;
      })
    );
  }

  export function combineLatestOrEmpty<T>(observables: OBS<T>[]): OBS<T[]> {
    if (observables.length === 0) {
      return of([]);
    }

    return combineLatest(observables);
  }

  export function onMount$(): OBS<void> {
    const subject = new Subject<void>();
    onMount(() => {
      subject.next();
      return () => {
        subject.complete();
      };
    });
    return subject;
  }

  export function resizeSensor$(element: HTMLElement): OBS<void> {
    return new Observable<void>((subscriber) => {
      const sensor = new ResizeSensor(element, () => {
        subscriber.next();
      });
      return function unsubscribe() {
        sensor.detach();
      };
    });
  }
}

export namespace Utils {
  export function createId(label: string): string {
    return `${label}-${crypto.randomUUID()}`;
  }

  /**
   * Returns the object if the predicate is true, otherwise returns false.
   */
  export function getOrFalse<T>(
    obj: T,
    predicate: (obj: T) => boolean
  ): T | false {
    return predicate(obj) ? obj : false;
  }
}
