import { first, Subject } from "rxjs";
import { Component } from "src/ex-object/ExObject";
import { ProtoComponentStore } from "src/ex-object/ProtoComponent";
import MainContext from "src/main-context/MainContext";
import { ExObjectMut } from "src/main-context/MainMutator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";

export type ComponentMut = Component &
  ExObjectMut & {
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