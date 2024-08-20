import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import {
  ComponentParameterKind,
  createCustomComponentParameter,
  type Component,
  type ComponentParameter,
  type CustomComponent,
  type CustomComponentParameter,
} from "src/ex-object/Component";
import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import { CreateExObject, type ExObject } from "src/ex-object/ExObject";
import { CreateProject } from "src/ex-object/Project";
import type {
  BasicProperty,
  CloneCountProperty,
  ComponentParameterProperty,
} from "src/ex-object/Property";
import {
  createLibraryProject,
  type LibraryProject,
} from "src/library/LibraryProject";
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
import { log5 } from "src/utils/utils/Log2";

const log55 = log5("Rehydrator.ts");
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

    const project = CreateProject.from(this.ctx, {
      rootExObjects,
      componentArr: customComponentArr,
    });

    log55.debug("Project loaded", project);

    const libraryProject = await createLibraryProject(this.ctx, {
      id: deProject.id,
      name: deProject.name,
      project,
    });

    const library = await firstValueFrom(this.ctx.library$);
    library.addProject(libraryProject);
    return libraryProject;
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
    log55.debug("rehydrateExObject.componentPropertyL.end");
    const basicPropertyL = await Promise.all(basicPropertyPL);
    log55.debug("rehydrateExObject.basicPropertyL.end");
    
    const cloneCountProperty = await this.rehydrateCloneCountProperty(
      deExObject.cloneProperty
    );

    log55.debug("rehydrateExObject.cloneCountProperty.end");

    const children$P = deExObject.children.map((child) => {
      return this.rehydrateExObject(child);
    });
    const children = await Promise.all(children$P);

    log55.debug("rehydrateExObject.children.end");

    const exObject: ExObject = await CreateExObject.blank(this.ctx, {
      component,
      id: deExObject.id,
      name: deExObject.name,
      componentProperties: componentPropertyL,
      basicProperties: basicPropertyL,
      cloneCountProperty,
      children,
    });

    log55.debug("rehydrateExObject.end");
    return exObject;
  }

  @loggedMethod
  public async rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ): Promise<ComponentParameterProperty> {
    log55.debug("rehydrateComponentProperty.start", deProperty);
    const parameter = this.getComponentParameter(
      deProperty.componentParameterId,
      deProperty.componentParameterKind
    );

    const expr = await this.rehydrateExpr(deProperty.expr);
    log55.debug("rehydrateComponentProperty.rehydrateExpr.end");
    const property = await Create.Property.component(this.ctx, deProperty.id, parameter, expr);
    log55.debug("rehydrateComponentProperty.end", property);
    return property;
  }

  @loggedMethod
  public async rehydrateBasicProperty(
    deProperty: DehydratedBasicProperty
  ): Promise<BasicProperty> {
    log55.debug("rehydrateBasicProperty.start", deProperty);

    const expr = await this.rehydrateExpr(deProperty.expr);
    
    log55.debug("rehydrateBasicProperty", deProperty);

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
    log55.debug("rehydrateExpr", deExpr);
    switch (deExpr.type) {
      case "NumberExpr":
        const newLocal = await this.rehydrateNumberExpr(deExpr);
        log55.debug("rehydrateExpr.rehydrateNumberExpr", newLocal);
        return newLocal;
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
    const newLocal = this.ctx.objectFactory.createNumberExpr(deExpr.value, deExpr.id);
    log55.debug("rehydrateNumberExpr", newLocal);
    return newLocal;
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
    switch (componentType) {
      case "CustomComponent":
        const component = this.customComponentById.get(componentId);
        assert(
          component !== undefined,
          `Component not found: ${componentId} ${componentType}`
        );
        return component;
      case "CanvasComponent":
        const component2 =
          this.ctx.componentCtx.getCanvasComponentById(componentId);
        return component2;
      default:
        throw new Error(`Unknown component type: ${componentType}`);
    }
  }

  private getComponentParameter(
    parameterId: string,
    parameterKind: ComponentParameterKind
  ): ComponentParameter {
    switch (parameterKind) {
      case ComponentParameterKind.CustomComponentParameter:
        const parameter = this.componentParameterById.get(parameterId);
        assert(
          parameter !== undefined,
          `Component parameter not found: ${parameterId} ${parameterKind}`
        );
        return parameter;
      case ComponentParameterKind.CanvasComponentParameter:
        log55.debug("getCanvasComponentParameterById", parameterId);
        const parameter2 =
          this.ctx.componentCtx.getCanvasComponentParameterById(parameterId);
        return parameter2;
      default:
        throw new Error(`Unknown component parameter type: ${parameterKind}`);
    }
  }
}
