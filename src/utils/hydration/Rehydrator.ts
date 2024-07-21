// @ts-nocheck

import type { Attribute, CallExpr, Expr, NumberExpr, Project } from "src/ex-object/ExObject";
import type ExObjectFactory from "src/ex-object/ExObjectFactory";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedAttribute,
  DehydratedCallExpr,
  DehydratedExpr,
  DehydratedNumberExpr,
} from "src/utils/hydration/Dehydrator";

let nextId = 0;

export default class Rehydrator {
  private readonly exprFactory: ExObjectFactory;
  public constructor(private readonly ctx: MainContext) {
    this.exprFactory = ctx.objectFactory;
  }

  public rehydrateProject(deProject: DehydratedProject): Project {
    throw new Error("Not implemented");
  }

  @loggedMethod
  public rehydrateAttribute(deAttribute: DehydratedAttribute): Attribute {
    const expr = this.rehydrateExpr(deAttribute.expr);
    return this.ctx.objectFactory.createAttribute(deAttribute.id + "rehydrated" + nextId++, expr);
  }

  @loggedMethod
  private rehydrateExpr(deExpr: DehydratedExpr): Expr {
    switch (deExpr.type) {
      case "NumberExpr":
        return this.rehydrateNumberExpr(deExpr);
      case "CallExpr":
        return this.rehydrateCallExpr(deExpr);
      default:
        throw new Error(`Unknown expr type: ${deExpr}`);
    }
  }
  
  @loggedMethod
  private rehydrateNumberExpr(deExpr: DehydratedNumberExpr): NumberExpr {
    return this.exprFactory.createNumberExpr(deExpr.value, deExpr.id + "rehydrated" + nextId++);
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg)=>this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(deExpr.id + "rehydrated" + nextId++, args);
  }
}
