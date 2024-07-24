import { first, Subject } from "rxjs";
import { Project, Component } from "src/ex-object/ExObject";
import { ProtoComponentStore } from "src/ex-object/ProtoComponent";
import MainContext from "src/main-context/MainContext";

export type ProjectMut = Project & {
  readonly rootComponentsSub$: Subject<readonly Component[]>;
  readonly currentOrdinalSub$: Subject<number>;
};

export default class ProjectMutator {
  public constructor(private readonly ctx: MainContext) {}

  public addRootComponent() {
    const component = this.ctx.objectFactory.createComponentNew(
      ProtoComponentStore.circle
    );

    this.ctx.eventBus.currentProject$.pipe(first()).subscribe((project) => {
      project.rootComponents$.pipe(first()).subscribe((rootComponents) => {
        const projectMut = project as unknown as ProjectMut;
        projectMut.rootComponentsSub$.next([...rootComponents, component]);
      });
    });
  }

  public newProject(): any {
    this.ctx.objectFactory.createProjectNew();
  }
}
