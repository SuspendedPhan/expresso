import { first, Subject } from "rxjs";
import { Component } from "src/ex-object/ExObject";
import { ProtoComponentStore } from "src/ex-object/ProtoComponent";
import MainContext from "src/main-context/MainContext";
import { ExObjectMut } from "src/main-context/MainMutator";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export type ComponentMut = Component &
  ExObjectMut & {
    readonly childrenSub$: Subject<readonly Component[]>;
  };

export default class ComponentMutator {
  public constructor(private readonly ctx: MainContext) {}

  public addRootComponent() {
    const component = this.ctx.objectFactory.createComponent(
      ProtoComponentStore.circle
    );

    this.ctx.eventBus.rootComponents$
      .pipe(first())
      .subscribe((rootComponents) => {
        const rootComponents$ = this.ctx.eventBus.rootComponents$ as Subject<
          Component[]
        >;
        rootComponents$.next([...rootComponents, component]);
      });
  }

  @loggedMethod
  public addChild(parent: Component) {
    Logger.logCallstack();
    const component = this.ctx.objectFactory.createComponent(
      ProtoComponentStore.circle
    );

    parent.children$.pipe(first()).subscribe((children) => {
      const parentMut = parent as unknown as ComponentMut;
      parentMut.childrenSub$.next([...children, component]);
    });
  }
}
