import assert from "assert-ts";
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
import { TreeNode } from "src/utils/TreeNode";
import { EffectUtils } from "src/utils/utils/EffectUtils";

export type FocusKind2 = string & Brand.Brand<"FocusKind2">;
export const FocusKind2 = Brand.nominal<FocusKind2>();

export class FocusTarget extends Data.TaggedClass("Focus2")<{
  kind: FocusKind2;
  item: any;
}> {}

type FocusTargetNode = TreeNode<FocusTarget>;

export class Focus2 extends Data.TaggedClass("Focus2")<{
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
      console.log("setFocus", target);
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
        console.log(1);
        yield* setFocus(target);
      }
      return;
    }

    const index = focusTargets_.findIndex((target) =>
      Equal.equals(target, currentFocus.value.target)
    );

    if (index !== -1 && index + 1 < focusTargets_.length) {
      const nextIndex = index + 1;
      const nextTarget = focusTargets_[nextIndex];
      assert(nextTarget !== undefined);
      console.log(index, nextIndex, nextTarget, focusTargets_.length);
      yield* setFocus(nextTarget);
    }
  });

  const navigateUp = Effect.gen(function* () {
    const currentFocus = yield* focus.get;
    const focusTargets_ = yield* focusTargets.get;

    if (Option.isNone(currentFocus)) {
      const target = focusTargets_[focusTargets_.length - 1];
      if (target) {
        yield* setFocus(target);
      }
      return;
    }

    const index = focusTargets_.findIndex((target) =>
      Equal.equals(target, currentFocus.value.target)
    );
    if (index !== -1 && index - 1 >= 0) {
      yield* setFocus(focusTargets_[index - 1]!);
    }
  });

  const focusByTarget = (target: FocusTarget) =>
    focus.changes.pipe(
      Stream.filter((f) => Option.isSome(f)),
      Stream.map((f) => f.value),
      Stream.filter((f) => Equal.equals(f.target, target))
    );

  const focus = yield* SubscriptionRef.make(Option.none<Focus2>());

  yield* focus.changes.pipe(
    Stream.runForEach((f) => Console.log("focus", Option.getOrNull(f)?.target)),
    Effect.forkDaemon
  );

  yield* EffectUtils.onKeyDown("ArrowDown").pipe(
    Stream.runForEach(() => navigateDown),
    Effect.forkDaemon
  );

  yield* EffectUtils.onKeyDown("ArrowUp").pipe(
    Stream.runForEach(() => navigateUp),
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
  forEditorView(project: Project): Stream.Stream<FocusTargetNode[]> {
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

  forExObject(exObject: ExObject): Stream.Stream<FocusTargetNode[]> {
    const results = [
      new FocusTarget({ kind: FocusKind2("ExObjectName"), item: exObject }),
      new FocusTarget({
        kind: FocusKind2("ExObjectComponent"),
        item: exObject,
      }),
    ];

    const v0 = createFocusTargets.forProperty(exObject.cloneCountProperty);

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

    const v3 = exObject.children.itemStream.pipe(
      Stream.flatMap(
        (oo) => {
          if (oo.length === 0) {
            return Stream.make([]);
          }
          const o = oo[0];
          assert(o !== undefined);
          return createFocusTargets.forExObject(o);
        },
        { switch: true }
      ),
      Stream.map((oo) => oo.flat())
    );

    return EffectUtils.zipLatestAllOrEmpty(v0, v1, v2, v3).pipe(
      Stream.map((vv) => [...results, ...vv.flat()])
    );
  },

  forProperty(property: Property): Stream.Stream<FocusTargetNode[]> {
    const results = [
      new FocusTarget({ kind: FocusKind2("PropertyName"), item: property }),
    ];

    const exprTargets = property.expr.changes.pipe(
      Stream.flatMap((expr) => {
        if (expr.type !== "Expr/Call") {
          return Stream.make([]);
        }
        return createFocusTargets.forExpr(expr);
      }),
      Stream.map((vv) => vv.flat())
    );

    return exprTargets.pipe(Stream.map((vv) => [...results, ...vv]));
  },

  forExpr(expr: Expr): FocusTargetNode {
    const exprTarget = new FocusTarget({ kind: FocusKind2("Expr"), item: expr });
    let children = [];
    if (expr.type === "Expr/Call") {
      children = `expr.args.map((arg) => createFocusTargets.forExpr(arg));`
    }
  },
};
