import { Attribute } from "pixi.js";
import { ReplaySubject, Subject } from "rxjs";
import { Component, Expr } from "../ExObject";
import { ExprReplacement } from "./MainContext";
import { SceneAttribute } from "../SceneAttribute";
import { OBS } from "../utils/Utils";

export class MainEventBus {
  public readonly rootComponents$: OBS<readonly Component[]>;
  public readonly componentAdded$: OBS<Component>;
  public readonly onSceneAttributeAdded$: OBS<SceneAttribute>;
  public readonly onAttributeAdded$: OBS<Attribute>;
  public readonly onExprAdded$: OBS<Expr>;
  public readonly onExprReplaced$: OBS<ExprReplacement>;

  public constructor() {
    this.rootComponents$ = new ReplaySubject<readonly Component[]>(10);
    this.componentAdded$ = new Subject<Component>();
    this.onSceneAttributeAdded$ = new ReplaySubject<SceneAttribute>(10);
    this.onAttributeAdded$ = new Subject<Attribute>();
    this.onExprAdded$ = new Subject<Expr>();
    this.onExprReplaced$ = new Subject<ExprReplacement>();
  }
}
