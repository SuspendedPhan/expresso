import { BehaviorSubject, Subject } from "rxjs";
import {
  Attribute,
  CallExpr,
  Component,
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
import MainContext from "./MainContext";
import { ProtoSceneAttribute, SceneAttribute } from "./SceneAttribute";
import { ProtoComponent } from "./ProtoComponent";

let nextId = 0;

export default class ExObjectFactory {
  public constructor(private readonly ctx: MainContext) {}

  createComponent(proto: ProtoComponent): Component {
    const id = `component-${nextId++}`;
    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);

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
      ...base,
      ...mutBase,
    };

    (this.ctx.onComponentAdded$ as Subject<Component>).next(component);
    return component;
  }

  createSceneAttribute(x: ProtoSceneAttribute): SceneAttribute {
    const attribute = this.createAttribute(x.id);
    const sceneAttribute: SceneAttribute = {
      proto: x,
      attribute,
    };

    (this.ctx.onSceneAttributeAdded$ as Subject<SceneAttribute>).next(
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

    (this.ctx.onAttributeAdded$ as Subject<Attribute>).next(attribute);
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

    (this.ctx.onExprAdded$ as Subject<Expr>).next(expr);
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

    (this.ctx.onExprAdded$ as Subject<Expr>).next(expr);
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
