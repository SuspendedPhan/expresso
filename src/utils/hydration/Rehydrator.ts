import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type { LibraryProject } from "src/library/LibraryProject";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedCallExpr,
  DehydratedExObject,
  DehydratedExpr,
  DehydratedNumberExpr,
  DehydratedProject,
  DehydratedProperty,
} from "src/utils/hydration/Dehydrator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export default class Rehydrator {
  public constructor(private readonly ctx: MainContext) {
  }

  public rehydrateProject(deProject: DehydratedProject): LibraryProject {
    const rootExObjects = deProject.rootExObjects.map((deExObject) =>
      this.rehydrateExObject(deExObject)
    );
    return this.ctx.projectManager.addProject(deProject.id, deProject.name, rootExObjects);
  }

  public rehydrateExObject(deExObject: DehydratedExObject): ExObject {
    const component = this.getComponent(deExObject.componentId, deExObject.componentType);
    const sceneAttributes = deExObject.map((sceneAttribute) =>
      this.rehydrateProperty(sceneAttribute)
    );

    const children = deExObject.children.map((child) =>
      this.rehydrateExObject(child)
    );

    return this.ctx.objectFactory.createExObject(deExObject.id, sceneAttributes, children, proto);
  }
  

  @loggedMethod
  public rehydrateProperty(
    deProperty: DehydratedProperty
  ): Property {
    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.object(this.ctx, deProperty.id, deProperty.name, expr);
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

  private getComponent(componentId: string, componentType: string) {
    throw new Error("Method not implemented.");
  }
}
