import { Context, Effect, Layer } from "effect";
import { firstValueFrom, map, ReplaySubject } from "rxjs";
import { ExFuncFactory2 } from "src/ex-object/ExFunc";
import { Project } from "src/ex-object/Project";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class ProjectCtx extends Context.Tag("ProjectCtx")<
  ProjectCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const currentProject$ = new ReplaySubject<Project>(1);
  return {
    getOrdinalProm() {
      return firstValueFrom(
        currentProject$.pipe(map(Project.getAndIncrementOrdinal))
      );
    },
    getCurrentProjectProm() {
      return firstValueFrom(currentProject$);
    },
    addRootExObjectBlank() {
      return firstValueFrom(
        currentProject$.pipe(map(Project.addRootExObjectBlank))
      );
    },
    addExFuncBlank() {
      return firstValueFrom(currentProject$.pipe(map(ExFuncFactory2.Custom)));
    },
    addComponentBlank() {
      return firstValueFrom(
        currentProject$.pipe(map(Project.addComponentBlank))
      );
    },
  };
});

export const ProjectCtxLive = Layer.effect(ProjectCtx, ctxEffect);

// // Create a tag for the ProjectCtx service
// class ProjectCtx extends Context.Tag("ProjectCtx")<
//   ProjectCtx,
//   {
//     getOrdinalProm(): Promise<number>;
//     getCurrentProjectProm(): Promise<Project>;
//     addRootExObjectBlank(): Promise<void>;
//     addExFuncBlank(): Promise<void>;
//     addComponentBlank(): Promise<void>;
//   }
// >() {}

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
