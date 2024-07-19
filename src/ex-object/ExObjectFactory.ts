import { Subject } from "rxjs";
import {
  type Attribute,
  type CallExpr,
  type Component,
  type ExObjectBase,
  ExObjectType,
  type Expr,
  ExprType,
  type NumberExpr,
  type Parent,
} from "src/ex-object/ExObject";
import Logger from "../logger/Logger";
import { loggedMethod } from "src/logger/LoggerDecorator";
import type MainContext from "src/main-context/MainContext";
import type {
  AttributeMut,
  CallExprMut,
  ExObjectMut,
  ExObjectMutBase,
} from "../main-context/MainMutator";
import type { ProtoComponent } from "src/ex-object/ProtoComponent";
import type { ProtoSceneAttribute, SceneAttribute } from "./SceneAttribute";
import {
  createBehaviorSubjectWithLifetime,
  createSubjectWithLifetime,
} from "src/utils/utils/Utils";

let nextId = 0;

export default class ExObjectFactory {
  public constructor(private readonly ctx: MainContext) {}

  createComponent(proto: ProtoComponent): Component {
    const id = `component-${nextId++}`;
    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);
    const cloneCountSub$ = createBehaviorSubjectWithLifetime(base.destroy$, 10);
    const sceneAttributeAdded$ = createSubjectWithLifetime<SceneAttribute>(
      base.destroy$
    );

    const sceneAttributeByProto = new Map<
      ProtoSceneAttribute,
      SceneAttribute
    >();
    for (const protoAttribute of proto.protoAttributes) {
      const sceneAttribute = this.createSceneAttribute(protoAttribute);
      sceneAttributeByProto.set(protoAttribute, sceneAttribute);
    }

    const component: Component = {
      objectType: ExObjectType.Component,
      proto,
      sceneAttributeByProto,
      cloneCount$: cloneCountSub$,
      sceneAttributeAdded$,
      ...base,
      ...mutBase,
    };

    (this.ctx.eventBus.componentAdded$ as Subject<Component>).next(component);
    return component;
  }

  createSceneAttribute(x: ProtoSceneAttribute): SceneAttribute {
    const attribute = this.createAttribute(x.id);
    const sceneAttribute: SceneAttribute = {
      proto: x,
      ...attribute,
    };

    (this.ctx.eventBus.onSceneAttributeAdded$ as Subject<SceneAttribute>).next(
      sceneAttribute
    );

    return sceneAttribute;
  }

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
    const exprSub$ = createBehaviorSubjectWithLifetime(base.destroy$, expr);

    const attribute: AttributeMut = {
      ...base,
      ...mutBase,
      objectType: ExObjectType.Attribute,
      expr$: exprSub$,
      exprSub$,
    };

    const exprMut = expr as ExObjectMut;
    exprMut.parentSub$.next(attribute);

    (this.ctx.eventBus.onAttributeAdded$ as unknown as Subject<Attribute>).next(
      attribute
    );
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

    (this.ctx.eventBus.onExprAdded$ as Subject<Expr>).next(expr);
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

    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);
    const argsSub$ = createBehaviorSubjectWithLifetime(base.destroy$, args);

    const expr: CallExprMut = {
      ...base,
      ...mutBase,
      objectType: ExObjectType.Expr,
      exprType: ExprType.CallExpr,
      args$: argsSub$,
      argsSub$,
    };

    for (const arg of args) {
      const argMut = arg as ExObjectMut;
      argMut.parentSub$.next(expr);
    }

    (this.ctx.eventBus.onExprAdded$ as Subject<Expr>).next(expr);
    return expr;
  }

  private createExObjectMutBase(): ExObjectMutBase {
    const destroySub$ = new Subject<void>();
    const parentSub$ = createBehaviorSubjectWithLifetime<Parent>(
      destroySub$,
      null
    );

    return {
      parentSub$,
      destroySub$,
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
