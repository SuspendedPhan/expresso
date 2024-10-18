import {
  Brand,
  Console,
  Data,
  Effect,
  Equal,
  Exit,
  Layer,
  Option,
  Ref,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";
import { DexWindow, ViewCtx } from "src/ctx/ViewCtx";
import type { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { Project, ProjectCtx } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export type FocusKind2 = string & Brand.Brand<"FocusKind2">;
export const FocusKind2 = Brand.nominal<FocusKind2>();

export class FocusTarget extends Data.TaggedClass("Focus2")<{
  kind: FocusKind2;
  item: any;
}> {}

class Focus2 extends Data.TaggedClass("Focus2")<{
  target: FocusTarget;
  isEditing: SubscriptionRef.SubscriptionRef<boolean>;
  scope: Scope.CloseableScope;
}> {}

export class Focus2Ctx extends Effect.Tag("Focus2Ctx")<
  Focus2Ctx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const viewCtx = yield* ViewCtx;
  const projectCtx = yield* ProjectCtx;

  let vv = viewCtx.activeWindow.pipe(
    Stream.flatMap(
      (window) => {
        const vv = Effect.gen(function* () {
          switch (window) {
            case DexWindow.ProjectEditor:
              return projectCtx.activeProject.changes.pipe(
                Stream.flatMap(
                  (project) => {
                    if (Option.isNone(project)) {
                      return Stream.make([]);
                    }
                    return createFocusTargets.forEditorView(project.value);
                  },
                  { switch: true }
                )
              );
            default:
              return Stream.empty;
          }
        });
        return vv.pipe(Stream.unwrap);
      },
      { switch: true }
    )
  );

  const focusTargets = yield* SubscriptionRef.make(new Array<FocusTarget>());
  yield* vv.pipe(
    Stream.tap((vv) => Console.log("focusTargets", vv)),
    Stream.runForEach((vv) => focusTargets.pipe(Ref.set(vv))),
    Effect.forkDaemon
  );

  const focusStack = new Array<Focus2>();

  const setFocus = (target: FocusTarget) =>
    Effect.gen(function* () {
      const currentFocus = yield* focus.get;
      if (Option.isSome(currentFocus)) {
        yield* Scope.close(currentFocus.value.scope, Exit.succeed(undefined));
      }

      const scope = yield* Scope.make();
      const newFocus = new Focus2({
        target,
        scope,
        isEditing: yield* SubscriptionRef.make(false),
      });
      focusStack.push(newFocus);
      yield* focus.pipe(Ref.set(Option.some(newFocus)));
    });

  const popFocus = () =>
    Effect.sync(() => {
      const previousFocus = focusStack.pop();
      if (previousFocus) {
        setFocus(previousFocus.target);
      }
    });

  const navigateDown = Effect.gen(function* () {
    const currentFocus = yield* focus.get;
    const focusTargets_ = yield* focusTargets.get;

    if (Option.isNone(currentFocus)) {
      const target = focusTargets_[0];
      if (target) {
        yield* setFocus(target);
      }
      return;
    }

    const index = focusTargets_.findIndex(
      (target) => target === currentFocus.value.target
    );
    if (index !== -1 && index + 1 < focusTargets_.length) {
      yield* setFocus(focusTargets_[index + 1]!);
    }
  });

  const focusByTarget = (target: FocusTarget) =>
    focus.changes.pipe(
      Stream.filter((f) => Option.isSome(f)),
      Stream.map((f) => f.value),
      Stream.filter((f) => Equal.equals(f.target, target)),
      Stream.tap((f) => Console.log(2, f.target, target)),
    );

  const focus = yield* SubscriptionRef.make(Option.none<Focus2>());

  yield* focus.changes.pipe(
    Stream.runForEach((f) => Console.log("focus", Option.getOrNull(f)?.target)),
    Effect.forkDaemon
  );

  yield* EffectUtils.onKeyDown("ArrowDown").pipe(
    Stream.runForEach(() =>
      Effect.gen(function* () {
        yield* navigateDown;
      })
    ),
    Effect.forkDaemon
  );

  return {
    setFocus,
    popFocus,
    navigateDown,
    focusByTarget,
    focus,
  };
});

export const Focus2CtxLive = Layer.effect(Focus2Ctx, ctxEffect);

const createFocusTargets = {
  forEditorView(project: Project): Stream.Stream<FocusTarget[]> {
    return project.rootExObjects.itemStream.pipe(
      Stream.flatMap(
        (oo) =>
          EffectUtils.zipLatestAllOrEmpty(
            ...oo.map((o) => createFocusTargets.forExObject(o))
          ),
        { switch: true }
      ),
      Stream.map((oo) => oo.flat())
    );
  },

  forExObject(exObject: ExObject): Stream.Stream<FocusTarget[]> {
    const results = [
      new FocusTarget({ kind: FocusKind2("ExObjectName"), item: exObject }),
      new FocusTarget({
        kind: FocusKind2("ExObjectComponent"),
        item: exObject,
      }),
    ];

    const v1 = exObject.componentParameterProperties_.itemStream.pipe(
      Stream.flatMap(
        (pp) =>
          EffectUtils.zipLatestAllOrEmpty(
            ...pp.map((p) => createFocusTargets.forProperty(p))
          ),
        { switch: true }
      ),
      Stream.map((vv) => vv.flat())
    );

    const v2 = exObject.basicProperties.itemStream.pipe(
      Stream.flatMap(
        (pp) =>
          EffectUtils.zipLatestAllOrEmpty(
            ...pp.map((p) => createFocusTargets.forProperty(p))
          ),
        { switch: true }
      ),
      Stream.map((vv) => vv.flat())
    );

    const v3 = createFocusTargets.forProperty(exObject.cloneCountProperty);

    return EffectUtils.zipLatestAllOrEmpty(v1, v2, v3).pipe(
      Stream.map(([vv1, vv2, vv3]) => [...results, ...vv1, ...vv2, ...vv3])
    );
  },

  forProperty(property: Property): Stream.Stream<FocusTarget[]> {
    const results = [
      new FocusTarget({ kind: FocusKind2("PropertyName"), item: property }),
    ];

    const exprTargets = property.expr.changes.pipe(
      Stream.flatMap((expr) => createFocusTargets.forExpr(expr)),
      Stream.map((vv) => vv.flat())
    );

    return exprTargets.pipe(Stream.map((vv) => [...results, ...vv]));
  },

  forExpr(expr: Expr): Stream.Stream<FocusTarget[]> {
    const results = [new FocusTarget({ kind: FocusKind2("Expr"), item: expr })];
    let stream: Stream.Stream<FocusTarget[]> = Stream.make([]);

    if (expr.type === "Expr/Call") {
      stream = expr.args.itemStream.pipe(
        Stream.flatMap(
          (aa) => {
            return EffectUtils.zipLatestAllOrEmpty(
              ...aa.map((a) => createFocusTargets.forExpr(a))
            );
          },
          { switch: true }
        ),
        Stream.map((vv) => vv.flat())
      );
    }

    return stream.pipe(
      Stream.flatMap((vv) => Stream.make([...results, ...vv]), {
        switch: true,
      })
    );
  },
};
