// @ts-nocheck

import assert from "assert-ts";
import { firstValueFrom, from } from "rxjs";
import {
  createCallExprBase,
  createSystemCallExpr,
} from "src/ex-object/CallExpr";
import {
  ComponentParameterKind,
  CreateComponent,
  createCustomComponentParameter,
  type ComponentFactory,
  type ComponentParameterFactory,
  type CustomComponent,
  type CustomComponentParameter,
} from "src/ex-object/Component";
import {
  createExFunc,
  createExFuncParameter,
  type ExFunc,
  type ExFuncParameter,
} from "src/ex-object/ExFunc";
import type { CallExpr, Expr, NumberExpr } from "src/ex-object/ExItem";
import { CreateExObject, type ExObject } from "src/ex-object/ExObject";
import {
  createReferenceExpr,
  ReferenceExpr2,
  type ReferenceExpr
} from "src/ex-object/Expr";
import { CreateProject } from "src/ex-object/Project";
import type {
  PropertyKind,
} from "src/ex-object/Property";
import {
  createLibraryProject,
  type LibraryProject,
} from "src/library/LibraryProject";
import { Create } from "src/main-context/Create";
import type MainContext from "src/main-context/MainContext";
import {
  DehydratedExpr,
  type DehydratedBasicProperty,
  type DehydratedCloneCountProperty,
  type DehydratedComponentProperty,
  type DehydratedCustomComponent,
  type DehydratedCustomComponentParameter,
  type DehydratedExFunc,
  type DehydratedExFuncParameter,
  type DehydratedExObject,
  type DehydratedExprKind,
  type DehydratedProject,
} from "src/utils/hydration/Dehydrator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { log5 } from "src/utils/utils/Log5";
import { matcher } from "variant";
import type { PropertyFactory } from "src/ex-object/Property";

const log55 = log5("Rehydrator.ts");

interface RehydratedReferenceExpr {
  referenceExpr2: ReferenceExpr2;
  dehydratedReferenceExpr: DehydratedExprKind["ReferenceExpr"];
}

export default class Rehydrator {
  private customComponentById = new Map<string, CustomComponent>();
  private rehydratedReferenceExprs = new Array<RehydratedReferenceExpr>();
  private targetById = new Map<string, ComponentParameter | ExFuncParameter | Property>();

  public constructor(private readonly ctx: MainContext) {}

  public async rehydrateProject(
    deProject: DehydratedProject
  ): Promise<LibraryProject> {
    log55.debug("rehydrateProject.start", deProject);

    const exFuncArr = await Promise.all(
      deProject.exFuncArr.map((deExFunc) => this.rehydrateExFunc(deExFunc))
    );

    const customComponentArr = await Promise.all(
      deProject.customComponents.map((deCustomComponent) =>
        this.rehydrateCustomComponent(deCustomComponent)
      )
    );

    log55.debug("rehydrateProject.customComponentArr.end", customComponentArr);

    const rootExObjects$P = deProject.rootExObjects.map((deExObject) =>
      this.rehydrateExObject(deExObject)
    );
    const rootExObjects = await Promise.all(rootExObjects$P);

    this.rehydrateTargets();

    const project = CreateProject.from(this.ctx, {
      rootExObjects,
      componentArr: customComponentArr,
      exFuncArr,
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

  private async rehydrateTargets() {
    for (const reRefExpr of this.rehydratedReferenceExprs) {
      const target = this.targetById.get(reRefExpr.dehydratedReferenceExpr.targetId);
      reRefExpr.referenceExpr2.target = target as any;
    }
  }

  public async rehydrateExFunc(deExFunc: DehydratedExFunc): Promise<ExFunc> {
    const expr = await this.rehydrateExpr(deExFunc.expr);
    const exFuncParameterArr = await Promise.all(
      deExFunc.parameters.map((deExFuncParameter) =>
        this.rehydrateExFuncParameter(deExFuncParameter)
      )
    );
    return createExFunc(this.ctx, {
      id: deExFunc.id,
      name: deExFunc.name,
      expr,
      exFuncParameterArr,
    });
  }

  public async rehydrateExFuncParameter(
    deExFuncParameter: DehydratedExFuncParameter
  ): Promise<ExFuncParameter> {
    const parameter = await createExFuncParameter(this.ctx, {
      id: deExFuncParameter.id,
      name: deExFuncParameter.name,
    });
    this.targetById.set(parameter.id, parameter);
    return parameter;
  }

  public async rehydrateCustomComponent(
    deCustomComponent: DehydratedCustomComponent
  ): Promise<CustomComponent> {
    const parameterArr = await Promise.all(
      deCustomComponent.parameters.map((deParameter) =>
        this.rehydrateComponentParameter(deParameter)
      )
    );

    const rootExObjectArr = await Promise.all(
      deCustomComponent.rootExObjects.map((deExObject) =>
        this.rehydrateExObject(deExObject)
      )
    );

    const component = await CreateComponent.custom(this.ctx, {
      id: deCustomComponent.id,
      name: deCustomComponent.name,
      parameters: parameterArr,
      rootExObjects: rootExObjectArr,
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
    this.targetById.set(parameter.id, parameter);
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
  ): Promise<PropertyKind["ComponentParameterProperty"]> {
    log55.debug("rehydrateComponentProperty.start", deProperty);
    const parameter = this.getComponentParameter(
      deProperty.componentParameterId,
      deProperty.componentParameterKind
    );

    const expr = await this.rehydrateExpr(deProperty.expr);
    log55.debug("rehydrateComponentProperty.rehydrateExpr.end", expr);
    const property = await Create.Property.component(
      this.ctx,
      deProperty.id,
      parameter,
      expr
    );
    log55.debug("rehydrateComponentProperty.end", property);
    return property;
  }

  @loggedMethod
  public async rehydrateBasicProperty(
    deProperty: DehydratedBasicProperty
  ): Promise<PropertyKind["BasicProperty"]> {
    log55.debug("rehydrateBasicProperty.start", deProperty);

    const expr = await this.rehydrateExpr(deProperty.expr);

    log55.debug("rehydrateBasicProperty", deProperty);

    const property = await Create.Property.basic(
      this.ctx,
      deProperty.id,
      deProperty.name,
      expr
    );
    this.targetById.set(property.id, property);
    return property;
  }

  @loggedMethod
  public async rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ): Promise<PropertyKind["CloneCountProperty"]> {
    log55.debug("rehydrateCloneCountProperty", deProperty);
    const expr = await this.rehydrateExpr(deProperty.expr);
    const property = await Create.Property.cloneCount(
      this.ctx,
      deProperty.id,
      expr
    );
    this.targetById.set(property.id, property);
    return property;
  }

  @loggedMethod
  private async rehydrateExpr(deExpr: DehydratedExpr): Promise<Expr> {
    log55.debug("rehydrateExpr", deExpr);
    const result = matcher(deExpr)
      .when(DehydratedExpr.Number, (deExpr) => {
        log55.debug("rehydrateExpr.Number", deExpr);
        return this.rehydrateNumberExpr(deExpr);
      })
      .when(DehydratedExpr.CallExpr, (deExpr) => this.rehydrateCallExpr(deExpr))
      .when(DehydratedExpr.ReferenceExpr, (deExpr) =>
        this.rehydrateReferenceExpr(deExpr)
      )
      .complete();
    return result;
  }

  @loggedMethod
  private async rehydrateNumberExpr(
    deExpr: DehydratedExprKind["Number"]
  ): Promise<NumberExpr> {
    const newLocal = this.ctx.objectFactory.createNumberExpr(
      deExpr.value,
      deExpr.id
    );
    log55.debug("rehydrateNumberExpr", newLocal);
    return newLocal;
  }

  @loggedMethod
  private async rehydrateCallExpr(
    deExpr: DehydratedExprKind["CallExpr"]
  ): Promise<CallExpr> {
    const argPL = deExpr.args.map((arg) => this.rehydrateExpr(arg));
    const argL = await Promise.all(argPL);
    const callExprBase = await createCallExprBase(this.ctx, {
      id: deExpr.id,
      args: argL,
    });
    const callExpr = createSystemCallExpr(this.ctx, { base: callExprBase });
    return callExpr;
  }

  @loggedMethod
  private async rehydrateReferenceExpr(
    deExpr: DehydratedExprKind["ReferenceExpr"]
  ): Promise<ReferenceExpr> {
    const reference2 = this.rehydrateReferenceExpr2(this, deExpr);
    const expr = createReferenceExpr(this.ctx, { reference2 });
    return expr;
  }

  private rehydrateReferenceExpr2(
    _ctx: Rehydrator,
    deExpr: DehydratedExprKind["ReferenceExpr"]
  ) {
    const creator = ReferenceExpr2[deExpr.referenceExprKind];
    const reference = creator({ target: null });
    this.rehydratedReferenceExprs.push({
        referenceExpr2: reference,
        dehydratedReferenceExpr: deExpr,
      });
    return reference;
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
        const parameter = this.targetById.get(parameterId);
        assert(
          parameter !== undefined,
          `Component parameter not found: ${parameterId} ${parameterKind}`
        );
        assert("componentParameterKind" in parameter);
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
