import { first, Subject } from "rxjs";
import { CanvasComponentStore, type Component } from "src/ex-object/Component";
import type { Project } from "src/ex-object/Project";
import { Create } from "src/main-context/Create";
import MainContext from "src/main-context/MainContext";

export type ProjectMut = Project & {
  readonly rootComponentsSub$: Subject<readonly Component[]>;
  readonly currentOrdinalSub$: Subject<number>;
};

export default class ProjectMutator {
  public constructor(private readonly ctx: MainContext) {}

  public async addRootObject() {
    const object = await Create.ExObject.blank(this.ctx, CanvasComponentStore.circle);
    this.ctx.eventBus.rootExObjectAdded$.next(object);

    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      project.rootExObjects$.pipe(first()).subscribe((rootObjects) => {
        project.rootExObjects$.next([...rootObjects, object]);
      });
    });
  }
}
