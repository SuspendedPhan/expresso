import type {
  CallExpr,
  Component,
  Expr,
  NumberExpr,
  Project
} from "src/ex-object/ExObject";
import type ExObjectFactory from "src/ex-object/ExObjectFactory";
import {
  getProtoComponentById
} from "src/ex-object/ProtoComponent";
import {
  getProtoSceneAttributeById,
  SceneAttribute,
} from "src/ex-object/SceneAttribute";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedCallExpr,
  DehydratedComponent,
  DehydratedExpr,
  DehydratedNumberExpr,
  DehydratedProject,
  DehydratedSceneAttribute,
} from "src/utils/hydration/Dehydrator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export default class Rehydrator {
  private readonly exprFactory: ExObjectFactory;
  public constructor(private readonly ctx: MainContext) {
    this.exprFactory = ctx.objectFactory;
  }

  public rehydrateProject(deProject: DehydratedProject): Project {
    const rootComponents = deProject.rootComponents.map((deComponent) =>
      this.rehydrateComponent(deComponent)
    );
    return this.ctx.libraryProjectManager.addProject(deProject.id, deProject.name, rootComponents);
  }

  public rehydrateComponent(deComponent: DehydratedComponent): Component {
    const proto = getProtoComponentById(deComponent.protoComponentId);
    const sceneAttributes = deComponent.sceneAttributes.map((sceneAttribute) =>
      this.rehydrateSceneAttribute(sceneAttribute)
    );

    const children = deComponent.children.map((child) =>
      this.rehydrateComponent(child)
    );

    return this.ctx.objectFactory.createComponent(deComponent.id, sceneAttributes, children, proto);
  }

  @loggedMethod
  public rehydrateSceneAttribute(
    deAttribute: DehydratedSceneAttribute
  ): SceneAttribute {
    const expr = this.rehydrateExpr(deAttribute.expr);
    const proto = getProtoSceneAttributeById(deAttribute.protoSceneAttributeId);
    return this.ctx.objectFactory.createSceneAttribute(
      deAttribute.id,
      expr,
      proto
    );
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
    return this.exprFactory.createNumberExpr(
      deExpr.value,
      deExpr.id
    );
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(
      deExpr.id,
      args
    );
  }
}
