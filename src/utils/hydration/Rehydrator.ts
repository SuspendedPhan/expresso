import type {
  Attribute,
  CallExpr,
  Component,
  Expr,
  NumberExpr,
  Project,
} from "src/ex-object/ExObject";
import type ExObjectFactory from "src/ex-object/ExObjectFactory";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedSceneAttribute,
  DehydratedCallExpr,
  DehydratedExpr,
  DehydratedNumberExpr,
  DehydratedProject,
  DehydratedComponent,
} from "src/utils/hydration/Dehydrator";
import {
  getProtoSceneAttributeById,
  SceneAttribute,
} from "src/ex-object/SceneAttribute";
import {
  getProtoComponentById,
  ProtoComponentStore,
} from "src/ex-object/ProtoComponent";

let nextId = 0;

export default class Rehydrator {
  private readonly exprFactory: ExObjectFactory;
  public constructor(private readonly ctx: MainContext) {
    this.exprFactory = ctx.objectFactory;
  }

  public rehydrateProject(deProject: DehydratedProject): Project {
    throw new Error("Not implemented");
  }

  public rehydrateComponent(deComponent: DehydratedComponent): Component {
    const proto = getProtoComponentById(deComponent.protoComponentId);
    const sceneAttributes = deComponent.sceneAttributes.map((sceneAttribute) =>
      this.rehydrateSceneAttribute(sceneAttribute)
    );
    return this.ctx.objectFactory.createComponentNew(proto, sceneAttributes);
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
      deExpr.id + "rehydrated" + nextId++
    );
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(
      deExpr.id + "rehydrated" + nextId++,
      args
    );
  }
}
