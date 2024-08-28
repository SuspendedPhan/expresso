import { Subject } from "rxjs";
import {
  type ExItemBase,
  ExItemType,
  type Expr,
  ExprType,
  type NumberExpr,
  type Parent
} from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { log5 } from "src/utils/utils/Log5";
import {
  createBehaviorSubjectWithLifetime
} from "src/utils/utils/Utils";

const log55 = log5("ExObjectFactory.ts");

export default class ExObjectFactory {
  public constructor(private readonly ctx: MainContext) {
  }


  @loggedMethod
  public async createNumberExpr(value?: number, id?: string): Promise<NumberExpr> {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const base = await this.createExItemBase(id);

    const expr: NumberExpr = {
      itemType: ExItemType.Expr,
      exprType: ExprType.NumberExpr,
      value,
      ...base,
    };

    log55.debug(`created number expr ${expr.id}`);

    (this.ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
    return expr;
  }

  public async createExItemBase(
    id: string
  ): Promise<ExItemBase> {
    const destroy$ = new Subject<void>();

    const exObjectBase: ExItemBase = {
      id,
      ordinal: 0,
      parent$: createBehaviorSubjectWithLifetime<Parent>(destroy$, null),
      destroy$,
    };
    return exObjectBase;
  }
}
