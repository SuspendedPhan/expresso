import {
  BehaviorSubject,
  Subject,
} from "rxjs";
import Logger from "./utils/Logger";

const logger = Logger.file("ExprFactory.ts");

export interface Attribute {
  readonly type: "Attribute";
  readonly id: string;
  readonly expr$: Subject<Expr>;
}

export type Expr = NumberExpr | CallExpr;

export interface NumberExpr {
  readonly type: "NumberExpr";
  readonly id: string;
  readonly value: number;
}

export interface CallExpr {
  readonly type: "CallExpr";
  readonly id: string;
  readonly args: Subject<Expr>[];
}

export default class ExprFactory {
  public readonly addAttribute$ = new Subject<Attribute>();
  public readonly addNumberExpr$ = new Subject<NumberExpr>();
  public readonly addCallExpr$ = new Subject<CallExpr>();

  public createAttribute(): Attribute {
    const expr: NumberExpr = {
      type: "NumberExpr",
      id: `expr-${Math.random()}`,
      value: 0,
    };

    const expr$ = new BehaviorSubject<Expr>(expr);
    const attribute: Attribute = {
      type: "Attribute",
      id: `attribute-${Math.random()}`,
      expr$,
    };

    return attribute;
  }

  public createNumberExpr(value: number): NumberExpr {
    return {
      type: "NumberExpr",
      id: `expr-${Math.random()}`,
      value,
    };
  }

  public createCallExpr(args: Expr[]): CallExpr {
    return {
      type: "CallExpr",
      id: `expr-${Math.random()}`,
      args: args.map((arg) => new BehaviorSubject<Expr>(arg)),
    };
  }
}
