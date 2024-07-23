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
    readonly childAddedSub$: Subject<Component>;
  };

export default class ComponentMutator {
  public constructor(private readonly ctx: MainContext) {}

  @loggedMethod
  public addChild(parent: Component): Component {
    Logger.logFunction();
    const logger = Logger.logger();
    logger.log("parent", parent);
    const component = this.ctx.objectFactory.createComponentNew(
      ProtoComponentStore.circle
    );

    const parentMut = parent as unknown as ComponentMut;
    parent.children$.pipe(first()).subscribe((children) => {
      parentMut.childrenSub$.next([...children, component]);
    });

    parentMut.childAddedSub$.next(component);

    return component;
  }
}
