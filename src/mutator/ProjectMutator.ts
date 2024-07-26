import { first, Subject } from "rxjs";
import { SceneComponentStore, type Component } from "src/ex-object/Component";
import type { Project } from "src/ex-object/ExItem";
import { createExObjectNew } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";

export type ProjectMut = Project & {
  readonly rootComponentsSub$: Subject<readonly Component[]>;
  readonly currentOrdinalSub$: Subject<number>;
};

export default class ProjectMutator {
  public constructor(private readonly ctx: MainContext) {}

  public async addRootObject() {
    const object = await createExObjectNew(this.ctx, SceneComponentStore.circle);

    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      project.rootObjects$.pipe(first()).subscribe((rootObjects) => {
        project.rootObjects$.next([...rootObjects, object]);
      });
    });
  }
}
