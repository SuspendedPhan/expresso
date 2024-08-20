import assert from "assert-ts";
import {
  createCustomComponentParameter,
  type Component,
  type ComponentParameter,
  type CustomComponent,
  type CustomComponentParameter
} from "src/ex-object/Component";
import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type {
  BasicProperty,
  CloneCountProperty,
  ComponentParameterProperty,
} from "src/ex-object/Property";
import type { LibraryProject } from "src/library/LibraryProject";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import type {
  DehydratedBasicProperty,
  DehydratedCallExpr,
  DehydratedCloneCountProperty,
  DehydratedComponentProperty,
  DehydratedCustomComponent,
  DehydratedCustomComponentParameter,
  DehydratedExObject,
  DehydratedExpr,
  DehydratedNumberExpr,
  DehydratedProject,
} from "src/utils/hydration/Dehydrator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export default class Rehydrator {
  private customComponentById = new Map<string, CustomComponent>();
  private componentParameterById = new Map<string, ComponentParameter>();

  public constructor(private readonly ctx: MainContext) {}

  public async rehydrateProject(
    deProject: DehydratedProject
  ): Promise<LibraryProject> {
    const rootExObjects$P = deProject.rootExObjects.map((deExObject) =>
      this.rehydrateExObject(deExObject)
    );
    const rootExObjects = await Promise.all(rootExObjects$P);

    const customComponentArr = await Promise.all(
      deProject.customComponents.map((deCustomComponent) =>
        this.rehydrateCustomComponent(deCustomComponent)
      )
    );

    return this.ctx.projectManager.addProject(
      deProject.id,
      deProject.name,
      rootExObjects,
    );
  }

  public async rehydrateCustomComponent(
    deCustomComponent: DehydratedCustomComponent
  ): Promise<CustomComponent> {
    const parameterArr = await Promise.all(
      deCustomComponent.parameters.map((deParameter) =>
        this.rehydrateComponentParameter(deParameter)
      )
    );

    const component = await Create.Component.custom(this.ctx, {
      id: deCustomComponent.id,
      name: deCustomComponent.name,
      parameters: parameterArr,
    });
    this.customComponentById.set(component.id, component);
    return component;
  }

  public async rehydrateComponentParameter(
    deParameter: DehydratedCustomComponentParameter
  ): Promise<CustomComponentParameter> {
    const parameter = await createCustomComponentParameter(this.ctx, {
      id: deParameter.id,
      name: deParameter.name,
    });
    this.componentParameterById.set(parameter.id, parameter);
    return parameter;
  }

  public async rehydrateExObject(
    deExObject: DehydratedExObject
  ): Promise<ExObject> {
    const component = this.getComponent(
      deExObject.componentId,
      deExObject.componentType
    );
    const componentPropertyPL = deExObject.componentProperties.map(
      (componentProperty) => {
        return this.rehydrateComponentProperty(componentProperty);
      }
    );

    const basicPropertyPL = deExObject.basicProperties.map((deProperty) =>
      this.rehydrateBasicProperty(deProperty)
    );

    const componentPropertyL = await Promise.all(componentPropertyPL);
    const basicPropertyL = await Promise.all(basicPropertyPL);

    const cloneCountProperty = await this.rehydrateCloneCountProperty(
      deExObject.cloneProperty
    );

    const children$P = deExObject.children.map((child) => {
      return this.rehydrateExObject(child);
    });
    const children = await Promise.all(children$P);

    const exObject: ExObject = await Create.ExObject.blank(this.ctx, {
      component,
      id: deExObject.id,
      name: deExObject.name,
      componentProperties: componentPropertyL,
      basicProperties: basicPropertyL,
      cloneCountProperty,
      children,
    });
    return exObject;
  }

  @loggedMethod
  public async rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ): Promise<ComponentParameterProperty> {
    const parameter = this.componentParameterById.get(
      deProperty.componentParameterId
    );
    assert(
      parameter !== undefined,
      `Component parameter not found: ${deProperty.componentParameterId}`
    );

    const expr = await this.rehydrateExpr(deProperty.expr);
    return Create.Property.component(this.ctx, deProperty.id, parameter, expr);
  }

  @loggedMethod
  public async rehydrateBasicProperty(
    deProperty: DehydratedBasicProperty
  ): Promise<BasicProperty> {
    const expr = await this.rehydrateExpr(deProperty.expr);
    return Create.Property.basic(
      this.ctx,
      deProperty.id,
      deProperty.name,
      expr
    );
  }

  @loggedMethod
  public async rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ): Promise<CloneCountProperty> {
    const expr = await this.rehydrateExpr(deProperty.expr);
    return Create.Property.cloneCount(this.ctx, deProperty.id, expr);
  }

  @loggedMethod
  private async rehydrateExpr(deExpr: DehydratedExpr): Promise<Expr> {
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
  private async rehydrateNumberExpr(
    deExpr: DehydratedNumberExpr
  ): Promise<NumberExpr> {
    return this.ctx.objectFactory.createNumberExpr(deExpr.value, deExpr.id);
  }

  @loggedMethod
  private async rehydrateCallExpr(
    deExpr: DehydratedCallExpr
  ): Promise<CallExpr> {
    const argPL = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    const argL = await Promise.all(argPL);
    return this.ctx.objectFactory.createCallExpr(deExpr.id, argL);
  }

  private getComponent(componentId: string, componentType: string): Component {
    console.log(
      "getComponent",
      componentId,
      componentType,
      this.customComponentById
    );
    throw new Error("Method not implemented.");
  }
}
