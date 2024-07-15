import { BehaviorSubject, Observable, Subject } from "rxjs";

export type OBS<T> = Observable<T>;
export type SUB<T> = Subject<T>;
export type BSUB<T> = BehaviorSubject<T>;
export type BSUB$$<T> = BehaviorSubject<Observable<T>>;

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}
