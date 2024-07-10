import { BehaviorSubject, Observable, of, switchMap } from 'rxjs'
import Logger from './utils/Logger'
import { ReadonlyExpr } from './domain/Expr';

export interface Attribute {
  readonly id: string;
  readonly expr$: Observable<ReadonlyExpr>;
}