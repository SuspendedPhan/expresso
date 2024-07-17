import { BehaviorSubject, Subject } from "rxjs";
import {
  Attribute,
  CallExpr,
  ExObjectBase,
  ExObjectType,
  Expr,
  ExprType,
  NumberExpr,
  Parent,
} from "./ExObject";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";
import {
  AttributeMut,
  CallExprMut,
  ExObjectMut,
  ExObjectMutBase,
} from "./MainMutator";
import { OBS } from "./utils/Utils";

let nextId = 0;

export default class ExObjectFactory {
  private readonly onExprAdded$_ = new Subject<Expr>();
  public readonly onExprAdded$: OBS<Expr> = this.onExprAdded$_;

  public constructor() {}

  @loggedMethod
  public createAttribute(id?: string, expr?: Expr): Attribute {
    const logger = Logger.logger();

    if (id === undefined) {
      id = `attribute-${nextId++}`;
      logger.log("id", "not given", id);
    } else {
      logger.log("id", "given", id);
    }

    if (expr === undefined) {
      expr = this.createNumberExpr();
    }

    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);
    const exprSub$ = new BehaviorSubject<Expr>(expr);

    const attribute: AttributeMut = {
      ...base,
      ...mutBase,
      objectType: ExObjectType.Attribute,
      expr$: exprSub$,
      exprSub$,
    };

    const exprMut = expr as ExObjectMut;
    exprMut.parentSub$.next(attribute);
    return attribute;
  }

  @loggedMethod
  public createNumberExpr(value?: number, id?: string): NumberExpr {
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);

    const expr: NumberExpr & ExObjectMut = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.NumberExpr,
      value,
      ...base,
      ...mutBase,
    };

    return expr;
  }

  @loggedMethod
  public createCallExpr(id?: string, args?: Expr[]): CallExpr {
    if (id === undefined) {
      id = `expr-${nextId++}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }

    const argsMut$ = new BehaviorSubject<Expr[]>(args);

    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);

    const expr: CallExprMut = {
      objectType: ExObjectType.Expr,
      exprType: ExprType.CallExpr,
      args$: argsMut$,
      argsSub$: argsMut$,
      ...base,
      ...mutBase,
    };
    
    for (const arg of args) {
      const argMut = arg as ExObjectMut;
      argMut.parentSub$.next(expr);
    }

    return expr;
  }

  private createExObjectMutBase(): ExObjectMutBase {
    return {
      parentSub$: new BehaviorSubject<Parent>(null),
      destroySub$: new Subject<void>(),
    };
  }

  private createExObjectBase(
    mutBase: ExObjectMutBase,
    id: string
  ): ExObjectBase {
    return {
      id,
      parent$: mutBase.parentSub$,
      destroy$: mutBase.destroySub$,
    };
  }
}
