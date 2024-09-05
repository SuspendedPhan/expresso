import { firstValueFrom } from "rxjs";
import type { CallExprKind } from "src/ex-object/CallExpr";
import type { Component } from "src/ex-object/Component";
import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExObject } from "src/ex-object/ExObject";
import type {
  ReferenceExpr
} from "src/ex-object/Expr";
import type { Property } from "src/ex-object/Property";
import type { SUB } from "src/utils/utils/Utils";

export type ExItem = Component | ExObject | Property | Expr | ExFunc;
export type Parent = Exclude<ExItem, NumberExpr> | null;
export type Expr =
  | NumberExpr
  | CallExpr
  | ReferenceExpr;

export enum ExItemType {
  Component,
  ExFunc,
  ExObject,
  Property,
  Expr,
}

export enum ExprType {
  NumberExpr,
  CallExpr,
  ReferenceExpr,
}

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  // Completes when destroyed.
  readonly destroy$: SUB<void>;
}

export interface NumberExpr extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

// export interface CallExpr extends ExItemBase {
//   readonly itemType: ExItemType.Expr;
//   readonly exprType: ExprType.CallExpr;
//   readonly args$: SUB<Expr[]>;
// }

export type CallExpr = typeof CallExprKind._Union;

export namespace ExItemFn {
  export async function* getAncestors(item: ExItem): AsyncGenerator<ExItem> {
    let parent: Parent = await firstValueFrom(item.parent$);
    while (parent !== null) {
      yield parent;
      parent = await firstValueFrom(parent.parent$);
    }
  }
}
