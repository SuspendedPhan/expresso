import type { Attribute } from "pixi.js";
import { combineLatest, map, of, ReplaySubject, Subject, switchMap } from "rxjs";
import type { Component, Expr, Project } from "src/ex-object/ExObject";
import type { OBS } from "src/utils/utils/Utils";
import type { SceneAttribute } from "../ex-object/SceneAttribute";
import type { ExprReplacement } from "./MainContext";

export class MainEventBus {
  public readonly currentProject$: OBS<Project>;
  public readonly rootComponents$: OBS<readonly Component[]>;
  public readonly componentAdded$: OBS<Component>;
  public readonly onSceneAttributeAdded$: OBS<SceneAttribute>;
  public readonly onAttributeAdded$: OBS<Attribute>;
  public readonly onExprAdded$: OBS<Expr>;
  public readonly onExprReplaced$: OBS<ExprReplacement>;
  
  public constructor() {
    this.currentProject$ = new ReplaySubject<Project>(1);
    this.rootComponents$ = this.currentProject$.pipe(switchMap((project) => project.rootComponents$));
    this.componentAdded$ = new ReplaySubject<Component>(10);
    this.onSceneAttributeAdded$ = new ReplaySubject<SceneAttribute>(1);
    this.onAttributeAdded$ = new Subject<Attribute>();
    this.onExprAdded$ = new ReplaySubject<Expr>(10);
    this.onExprReplaced$ = new Subject<ExprReplacement>();
  }

  public getDescendants$(component: Component): OBS<readonly Component[]> {
    return component.children$.pipe(
      switchMap((children) => {
        if (children.length === 0) {
          return of([]);
        }

        const childrenDescendants$ = children.map((child) => this.getDescendants$(child));
        return combineLatest(childrenDescendants$).pipe(
          map((childrenDescendants) => childrenDescendants.flat())
        );
      })
    );
  }
}
