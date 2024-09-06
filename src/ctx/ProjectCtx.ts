import { Effect, Context, Layer } from "effect";
import { firstValueFrom, ReplaySubject } from "rxjs";
import { ExFuncFactory2 } from "src/ex-object/ExFunc";
import { Project } from "src/ex-object/Project";
import type MainContext from "src/main-context/MainContext";

// Create a tag for the ProjectCtx service
class ProjectCtx extends Context.Tag("ProjectCtx")<
  ProjectCtx,
  {
    getOrdinalProm(): Promise<number>;
    getCurrentProjectProm(): Promise<Project>;
    addRootExObjectBlank(): Promise<void>;
    addExFuncBlank(): Promise<void>;
    addComponentBlank(): Promise<void>;
  }
>() {}

// const ProjectCtxLive = Layer.succeed(
//   ProjectCtx,
//   Effect.gen(function* () {
//     const currentProject$ = new ReplaySubject<Project>(1);
//     return {

//     };
//   })
// );

// export function createProjectContext(ctx: MainContext) {
//   return {
//     currentProject$: ctx.projectManager.currentProject$,
//     async getOrdinalProm() {
//       const project = await firstValueFrom(ctx.projectManager.currentProject$);
//       return Project.getAndIncrementOrdinal(project);
//     },
//     async getCurrentProjectProm() {
//       return firstValueFrom(ctx.projectManager.currentProject$);
//     },
//     async addRootExObjectBlank() {
//       const project = await firstValueFrom(ctx.projectManager.currentProject$);
//       return project.addRootExObjectBlank();
//     },
//     async addExFuncBlank() {
//       const project = await firstValueFrom(ctx.projectManager.currentProject$);
//       const exFunc = await ExFuncFactory2.Custom(ctx, {});
//       return project.addCustomExFunc(exFunc);
//     },
//     async addComponentBlank() {
//       const project = await firstValueFrom(ctx.projectManager.currentProject$);
//       return Project.addComponentBlank(ctx, project);
//     },
//   };
// }
