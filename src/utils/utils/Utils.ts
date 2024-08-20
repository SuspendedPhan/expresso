import assert from "assert-ts";
import { BehaviorSubject, combineLatest, map, of, partition, pipe, Subject, type Observable } from "rxjs";

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
}

export function rxEquals<T>(obj: T) {
  return pipe(
    map((other: T | false) => {
      return obj === other;
    })
  );
}

export function partitionFirst<T>(
  observable: OBS<T>
): [OBS<T>, OBS<T>] {
  return partition(observable, (_, index) => index === 0);
}

export namespace RxFns {
  export function combineLatestOrEmpty<T>(
    observables: OBS<T>[]
  ): OBS<T[]> {
    if (observables.length === 0) {
      return of([]);
    }

    return combineLatest(observables);
  }
}

export namespace Utils {
  export function createId(label: string): string {
    return `${label}-${crypto.randomUUID()}`;
  }
}