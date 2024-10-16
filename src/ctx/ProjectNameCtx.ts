import { Effect, Layer } from "effect";

// const log55 = log5("ProjectNameCtx.ts");

export class ProjectNameCtx extends Effect.Tag("ProjectNameCtx")<
  ProjectNameCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createProjectNameFieldData() {
      return Effect.gen(function* () {
        // const projectName$ = new BehaviorSubject<string>("");

        // const projectNameFieldData: FieldValueData = yield* Effect.gen(
        //   function* () {
        //     const libraryProjectCtx = yield* LibraryProjectCtx;

        //     const projectNameFieldData =
        //       yield* createTextFieldValueData<NavProjectNameFocus>({
        //         value$: projectName$,
        //         focusIsFn: isType(NavProjectNameFocusFactory),
        //         createEditingFocusFn: (isEditing) =>
        //           NavProjectNameFocusFactory({ isEditing }),
        //         filterFn: () => true,
        //       });
        //     yield* Effect.forkDaemon(
        //       Stream.runForEach(projectNameFieldData.onInput, (value) => {
        //         return Effect.gen(function* () {
        //           log55.debug("Updating project name: input");
        //           const vv = yield* libraryProjectCtx.activeLibraryProject;
        //           yield* Ref.set(vv.name, value);
        //         });
        //       })
        //     );
        //     return projectNameFieldData;
        //   }
        // );

        // yield* Effect.forkDaemon(Effect.gen(function* () {
        //   log55.debug("Updating project name: start");
        //   // TODO: leak
        //   const libraryProjectCtx = yield* LibraryProjectCtx;
        //   const activeLibraryProject = EffectUtils.obsToStream(
        //     libraryProjectCtx.activeLibraryProject$
        //   );
        //   const name = Stream.flatMap(
        //     activeLibraryProject,
        //     (activeLibraryProject2) => {
        //       log55.debug(
        //         "Updating project name: active library project changed"
        //       );
        //       return activeLibraryProject2.name.changes;
        //     },
        //     { switch: true }
        //   );
        //   yield* Stream.runForEach(name, (name2) => {
        //     return Effect.gen(function* () {
        //       projectName$.next(name2);
        //     });
        //   });
        // }));

        // return projectNameFieldData;
      });
    },
  };
});

export const ProjectNameCtxLive = Layer.effect(ProjectNameCtx, ctxEffect);
