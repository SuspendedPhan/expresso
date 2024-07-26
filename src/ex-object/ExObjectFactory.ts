import { BehaviorSubject, first, Subject } from "rxjs";
import {
  type Attribute,
  type CallExpr,
  type Component,
  type ExObjectBase,
  ExItemType,
  type Expr,
  ExprType,
  type NumberExpr,
  type Parent,
  type Project,
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
import type { ProtoSceneProperty, SceneProperty } from "./SceneAttribute";
import type { ComponentMut } from "src/mutator/ComponentMutator";
import type { ProjectMut } from "src/mutator/ProjectMutator";
import type { LibraryProject } from "src/library/LibraryProject";

export default class ExObjectFactory {
  private currentOrdinal = 0;
  public constructor(private readonly ctx: MainContext) {
    this.ctx.projectManager.currentProject$.subscribe((project) => {
      project.currentOrdinal$.subscribe((ordinal) => {
        this.currentOrdinal = ordinal;
      });
    });
  }

  public createProject(libraryProject: LibraryProject, rootComponents: readonly Component[]): Project {
    const rootComponentsSub$ = new BehaviorSubject<readonly Component[]>(
      rootComponents
    );

    const currentOrdinalSub$ = new BehaviorSubject<number>(0);

    const project: ProjectMut = {
      libraryProject,
      rootComponents$: rootComponentsSub$,
      rootComponentsSub$,
      currentOrdinal$: currentOrdinalSub$,
      currentOrdinalSub$,
    };

    return project;
  }

  public createComponent(id: string, sceneAttributes: readonly SceneProperty[], children: readonly Component[], proto: ProtoComponent): Component {
    const mutBase = this.createExObjectBaseMut();
    const base = this.createExObjectBase(mutBase, id);
    const cloneCountSub$ = createBehaviorSubjectWithLifetime(base.destroy$, 10);
    const childrenSub$ = createBehaviorSubjectWithLifetime<readonly Component[]>(base.destroy$, []);
    const sceneAttributeAdded$ = createSubjectWithLifetime<SceneProperty>(
      base.destroy$
    );

    const sceneAttributeByProto = new Map<
      ProtoSceneProperty,
      SceneProperty
    >();

    if (proto.protoAttributes.length !== sceneAttributes.length) {
      throw new Error("Scene attributes length does not match component proto");
    }

    for (const sceneAttribute of sceneAttributes) {
      sceneAttributeByProto.set(sceneAttribute.proto, sceneAttribute);
      if (!proto.protoAttributes.includes(sceneAttribute.proto)) {
        console.log(proto.protoAttributes);
        console.log(sceneAttribute.proto);
        throw new Error("Scene attribute proto not in component proto");
      }
    }

    const component: ComponentMut = {
      objectType: ExItemType.Component,
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

    childrenSub$.next(children);
    for (const child of children) {
      const childMut = child as unknown as ComponentMut;
      childMut.parentSub$.next(component);
    }

    (this.ctx.eventBus.componentAdded$ as Subject<Component>).next(component);
    return component;
  }

  public createComponentNew(proto: ProtoComponent): Component {
    const id = `component-${crypto.randomUUID()}`;

    const sceneAttributes: SceneProperty[] = [];
    for (const protoAttribute of proto.protoAttributes) {
      const sceneAttribute = this.createSceneAttributeNew(protoAttribute);
      sceneAttributes.push(sceneAttribute);
    }

    const component = this.createComponent(id, sceneAttributes, [], proto);
    return component;
  }


  @loggedMethod
  public createNumberExpr(value?: number, id?: string): NumberExpr {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const mutBase = this.createExObjectBaseMut();
    const base = this.createExObjectBase(mutBase, id);

    const expr: NumberExpr & ExObjectMut = {
      objectType: ExItemType.Expr,
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
      id = `expr-${crypto.randomUUID()}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }

    const mutBase = this.createExObjectBaseMut();
    const base = this.createExObjectBase(mutBase, id);
    const argsSub$ = createBehaviorSubjectWithLifetime(base.destroy$, args);

    const expr: CallExprMut = {
      ...base,
      ...mutBase,
      objectType: ExItemType.Expr,
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

  public createExObjectBaseMut(): ExObjectMutBase {
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

  public createExObjectBase(
    mutBase: ExObjectMutBase,
    id: string
  ): ExObjectBase {
    const exObjectBase = {
      id,
      ordinal: this.currentOrdinal,
      parent$: mutBase.parentSub$,
      destroy$: mutBase.destroySub$,
    };
    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      (project as ProjectMut).currentOrdinalSub$.next(this.currentOrdinal + 1);
    });
    return exObjectBase;
  }
}
