import assert from "assert-ts";
import type {
  Component,
  ComponentParameter,
  CustomComponent,
} from "src/ex-object/Component";
import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type {
  BasicProperty,
  CloneCountProperty,
  ComponentParameterProperty
} from "src/ex-object/Property";
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

export default class Rehydrator {
  // @ts-ignore
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

    console.error("need to hydrate the parameters and components");

    return this.ctx.projectManager.addProject(
      deProject.id,
      deProject.name,
      rootExObjects
    );
  }

  public async rehydrateExObject(
    deExObject: DehydratedExObject
  ): Promise<ExObject> {
    const component = this.getComponent(
      deExObject.componentId,
      deExObject.componentType,
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

    const children$P = deExObject.children.map((child) => {
      return this.rehydrateExObject(child);
    });
    const children = await Promise.all(children$P);

    const exObject: ExObject = await Create.ExObject.from(
      this.ctx,
      component,
      deExObject.id,
      componentProperties,
      basicProperties,
      cloneCountProperty,
      children
    );
    return exObject;
  }

  @loggedMethod
  public rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ): ComponentParameterProperty {
    const parameter = this.componentParameterById.get(
      deProperty.componentParameterId
    );
    assert(
      parameter !== undefined,
      `Component parameter not found: ${deProperty.componentParameterId}`
    );

    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.component(this.ctx, deProperty.id, parameter, expr);
  }

  @loggedMethod
  public rehydrateBasicProperty(
    deProperty: DehydratedBasicProperty
  ): BasicProperty {
    const expr = this.rehydrateExpr(deProperty.expr);
    return Create.Property.basic(this.ctx, deProperty.id, deProperty.name, expr);
  }

  @loggedMethod
  public rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ): CloneCountProperty {
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
    return this.ctx.objectFactory.createNumberExpr(deExpr.value, deExpr.id);
  }

  @loggedMethod
  private rehydrateCallExpr(deExpr: DehydratedCallExpr): CallExpr {
    const args = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    return this.ctx.objectFactory.createCallExpr(deExpr.id, args);
  }

  private getComponent(
    // @ts-ignore
    componentId: string,
    // @ts-ignore
    componentType: string,
  ): Component {
    throw new Error("Method not implemented.");
  }
}
