import type { Component, ComponentParameter, CustomComponent } from "src/ex-object/Component";
import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { ComponentParameterProperty, Property } from "src/ex-object/Property";
import type { LibraryProject } from "src/library/LibraryProject";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedBasicProperty,
  DehydratedCallExpr,
  DehydratedCloneCountProperty,
  DehydratedComponentProperty,
  DehydratedExObject,
  DehydratedExpr,
  DehydratedNumberExpr,
  DehydratedProject,
} from "src/utils/hydration/Dehydrator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { Assert } from "src/utils/utils/Assert";

export default class Rehydrator {
  private customComponentById = new Map<string, CustomComponent>();
  private componentParameterById = new Map<string, ComponentParameter>();

  public constructor(private readonly ctx: MainContext) {}

  public rehydrateProject(deProject: DehydratedProject): LibraryProject {
    const rootExObjects = deProject.rootExObjects.map((deExObject) =>
      this.rehydrateExObject(deExObject)
    );
    return this.ctx.projectManager.addProject(
      deProject.id,
      deProject.name,
      rootExObjects
    );
  }

  public rehydrateExObject(
    deExObject: DehydratedExObject,
    customComponentById: Map<string, CustomComponent>
  ): ExObject {
    const component = this.getComponent(
      deExObject.componentId,
      deExObject.componentType,
      customComponentById
    );
    const componentProperties = deExObject.componentProperties.map(
      (componentProperty) => {
        return this.rehydrateComponentProperty(componentProperty);
      }
    );

    const basicProperties = deExObject.basicProperties.map((deProperty) =>
      this.rehydrateBasicProperty(deProperty)
    );

    const cloneCountProperty = this.rehydrateCloneCountProperty(
      deExObject.cloneProperty
    );

    const children = deExObject.children.map((child) =>
      this.rehydrateExObject(child, customComponentById)
    );

    return Create.ExObject.from(
      this.ctx,
      component,
      deExObject.id,
      componentProperties,
      basicProperties,
      cloneCountProperty,
      children
    );
  }

  @loggedMethod
  public rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ): ComponentParameterProperty {
    const parameter = this.componentParameterById.get(deProperty.componentParameterId);
    Assert.notUndefined(parameter, `Component parameter not found: ${deProperty.componentParameterId}`);
    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.component(this.ctx, deProperty.id, parameter, expr);
  }

  @loggedMethod
  public rehydrateBasicProperty(deProperty: DehydratedBasicProperty): Property {
    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.basic(this.ctx, deProperty.id, expr);
  }

  @loggedMethod
  public rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ): Property {
    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.cloneCount(this.ctx, deProperty.id, expr);
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
    return this.exprFactory.createNumberExpr(deExpr.value, deExpr.id);
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    return this.exprFactory.createCallExpr(deExpr.id, args);
  }

  private getComponent(
    componentId: string,
    componentType: string,
    customComponentById: Map<string, CustomComponent>
  ): Component {
    throw new Error("Method not implemented.");
  }
}
