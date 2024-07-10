import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import Logger from "./utils/Logger";
import { ReadonlyExpr } from "./domain/Expr";

export class ReadonlyAttribute {
  readonly id: string = `attribute-${Math.random()}`;
  public constructor(public readonly expr$: Observable<ReadonlyExpr>) {}
}
