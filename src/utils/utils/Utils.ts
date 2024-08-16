import { BehaviorSubject, map, pipe, Subject, type Observable } from "rxjs";

export type OBS<T> = Observable<T>;
export type SUB<T> = Subject<T>;
export type BSUB<T> = BehaviorSubject<T>;
export type BSUB$$<T> = BehaviorSubject<Observable<T>>;

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}

export function createSubjectWithLifetime<T>(complete$: Observable<void>): Subject<T> {
  const subject = new Subject<T>();
  complete$.subscribe({
    complete: () => {
      subject.complete();
    },
  });
  return subject;
}

export function createBehaviorSubjectWithLifetime<T>(complete$: Observable<void>, initialValue: T): BehaviorSubject<T> {
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
  export function getFromBack<T>(arr: T[], index: number): T | undefined{
    return arr[arr.length - 1 - index];
  }
}

export function rxEquals(obj: any) {
  return pipe(
    map((other) => {
      return obj === other;
    })
  );
}