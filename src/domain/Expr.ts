// import { Observable } from "rxjs";
// import { ReadonlyAttribute } from "../Domain";

import { Observable } from "rxjs";
import { ReadonlyAttribute } from "../Domain";

// export type Parent = ReadonlyCallExpr | ReadonlyAttribute | null;

// export class ReadonlyExpr {
//   public readonly id = `expr-${Math.random()}`;
//   public constructor(public readonly parent$: Observable<Parent>) {}
// }

// export class ReadonlyNumberExpr extends ReadonlyExpr {
//   public constructor(
//     public readonly value$: Observable<number>,
//     parent$: Observable<Parent>
//   ) {
//     super(parent$);
//   }
// }

// export class ReadonlyCallExpr extends ReadonlyExpr {
//   public constructor(
//     public readonly args$: Observable<Observable<ReadonlyExpr>[]>,
//     parent$: Observable<Parent>
//   ) {
//     super(parent$);
//   }
// }

export type ReadonlyExpr = ReadonlyNumberExpr | ReadonlyCallExpr;
export type Parent = ReadonlyCallExpr | ReadonlyAttribute | null;

export interface ReadonlyExprBase {
  readonly id: string;
  readonly parent: Parent;
}

export interface ReadonlyNumberExpr {
  readonly type: "NumberExpr";
  readonly expr: ReadonlyExprBase;
  readonly value$: Observable<number>;
}

export interface ReadonlyCallExpr {
  readonly type: "CallExpr";
  readonly expr: ReadonlyExprBase;
  readonly args$: Observable<Observable<ReadonlyExpr>[]>;
}