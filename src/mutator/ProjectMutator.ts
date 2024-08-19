import { first, Subject } from "rxjs";
import { type Component } from "src/ex-object/Component";
import { CreateExObject } from "src/ex-object/ExObject";
import type { Project } from "src/ex-object/Project";
import MainContext from "src/main-context/MainContext";

export type ProjectMut = Project & {
  readonly rootComponentsSub$: Subject<readonly Component[]>;
  readonly currentOrdinalSub$: Subject<number>;
};

export default class ProjectMutator {
  public constructor(private readonly ctx: MainContext) {}

  public async addRootObject() {
    const object = await CreateExObject.blank(this.ctx, {});
    this.ctx.eventBus.rootExObjectAdded$.next(object);

    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      project.rootExObjects$.pipe(first()).subscribe((rootObjects) => {
        project.rootExObjects$.next([...rootObjects, object]);
      });
    });
  }
}
