import { BehaviorSubject, Subject } from "rxjs";
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
  Project,
} from "src/ex-object/ExObject";
import type { ProtoComponent } from "src/ex-object/ProtoComponent";
import type MainContext from "src/main-context/MainContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import {
  createBehaviorSubjectWithLifetime,
  createSubjectWithLifetime,
} from "src/utils/utils/Utils";
import type {
  AttributeMut,
  CallExprMut,
  ExObjectMut,
  ExObjectMutBase,
} from "../main-context/MainMutator";
import type { ProtoSceneAttribute, SceneAttribute } from "./SceneAttribute";
import { ComponentMut } from "src/mutator/ComponentMutator";

let nextId = 0;

export default class ExObjectFactory {
  public constructor(private readonly ctx: MainContext) {}

  createProject(): Project {
    const id = `project-${nextId++}`;
    const rootComponentsSub$ = new BehaviorSubject<readonly Component[]>([]);

    const project: Project = {
      id,
      rootComponents$: rootComponentsSub$,
    };

    (this.ctx.eventBus.currentProject$ as Subject<Project>).next(project);
    return project;
  }


  createComponentNew(proto: ProtoComponent): Component {
    const id = `component-${nextId++}`;
    const mutBase = this.createExObjectMutBase();
    const base = this.createExObjectBase(mutBase, id);
    const cloneCountSub$ = createBehaviorSubjectWithLifetime(base.destroy$, 10);
    const childrenSub$ = createBehaviorSubjectWithLifetime<readonly Component[]>(base.destroy$, []);
    const sceneAttributeAdded$ = createSubjectWithLifetime<SceneAttribute>(
      base.destroy$
    );

    const sceneAttributeByProto = new Map<
      ProtoSceneAttribute,
      SceneAttribute
    >();
    for (const protoAttribute of proto.protoAttributes) {
      const sceneAttribute = this.createSceneAttributeNew(protoAttribute);
      sceneAttributeByProto.set(protoAttribute, sceneAttribute);
    }

    const component: ComponentMut = {
      objectType: ExObjectType.Component,
      proto,
      sceneAttributeByProto,
      cloneCount$: cloneCountSub$,
      children$: childrenSub$,
      childrenSub$,
      sceneAttributeAdded$,
      ...base,
      ...mutBase,
    };

    for (const sceneAttribute of sceneAttributeByProto.values()) {
      const sceneAttributeMut = sceneAttribute as unknown as AttributeMut;
      sceneAttributeMut.parentSub$.next(component);
    }

    (this.ctx.eventBus.componentAdded$ as Subject<Component>).next(component);
    return component;
  }

  public createSceneAttribute(id: string, expr: Expr, proto: ProtoSceneAttribute): SceneAttribute {
    const attribute = this.createAttributeBase(id, expr);
    const sceneAttribute: SceneAttribute = {
      proto,
      ...attribute,
    };

    const exprMut = expr as unknown as ExObjectMut;
    exprMut.parentSub$.next(sceneAttribute);

    (this.ctx.eventBus.onSceneAttributeAdded$ as Subject<SceneAttribute>).next(
      sceneAttribute
    );

    return sceneAttribute;
  }

  private createSceneAttributeNew(proto: ProtoSceneAttribute): SceneAttribute {
    const id = `scene-attribute-${nextId++}`;
    const expr = this.createNumberExpr();
    return this.createSceneAttribute(id, expr, proto);
  }

  public createAttribute(): Attribute {
    const id = `attribute-${nextId++}`;
    const expr = this.createNumberExpr();
    return this.createAttribute1(id, expr);
  }

  private createAttribute1(id: string, expr: Expr): Attribute {
    const attribute = this.createAttributeBase(id, expr);
    const exprMut = expr as ExObjectMut;
    exprMut.parentSub$.next(attribute);
    return attribute;
  }

  @loggedMethod
  private createAttributeBase(id: string, expr: Expr): Attribute {
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
