import { Observable } from "rxjs";
import { ReadonlyExpr } from "./domain/Expr";

// export class ReadonlyAttribute {
//   readonly id: string = `attribute-${Math.random()}`;
//   public constructor(public readonly expr$: Observable<ReadonlyExpr>) {}
// }

export interface ReadonlyAttribute {
  readonly type: "Attribute";
  readonly id: string;
  readonly expr$: ReadonlyExpr;
}