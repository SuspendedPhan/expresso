import { first, Subject } from "rxjs";
import type { Component } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";
import type { ExItemMut } from "src/main-context/MainMutator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export type ComponentMut = Component &
  ExItemMut & {
    readonly childrenSub$: Subject<readonly Component[]>;
  };

export default class ComponentMutator {
  public constructor(private readonly ctx: MainContext) {}

  @loggedMethod
  public addChild(parent: Component) {
    const component = this.ctx.objectFactory.createComponentNew(
      ProtoComponentStore.circle
    );

    parent.children$.pipe(first()).subscribe((children) => {
      const parentMut = parent as unknown as ComponentMut;
      parentMut.childrenSub$.next([...children, component]);
    });
  }
}
