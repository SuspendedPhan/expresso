import { Brand, Data, Effect, Layer, Stream } from "effect";
import type { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import type { Project } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";

type FocusKind = string & Brand.Brand<"FocusKind">;
const FocusKind = Brand.nominal<FocusKind>();

export class Focus2 extends Data.TaggedClass("Focus2")<{
  kind: FocusKind;
  target: any;
}> {}

export class Focus2Ctx extends Effect.Tag("Focus2Ctx")<
  Focus2Ctx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {};
});

export const Focus2CtxLive = Layer.effect(Focus2Ctx, ctxEffect);

const createFocusList = {
  forEditorView(project: Project): Stream.Stream<Focus2[]> {
    project.rootExObjects.itemStream.pipe(
      Stream.map((o) => createFocusList.forExObject(o))
    );

    return Effect.gen(function* () {
      const vv = yield* Effect.all(
        project.rootExObjects.items.map((o) => createFocusList.forExObject(o))
      );
      return vv.flat();
    });
  },

  forExObject(exObject: ExObject): Stream.Stream<Focus2[]> {


    

    throw new Error("Not implemented");

    return Effect.gen(function* () {
      const results = [
        new Focus2({ kind: FocusKind("ExObjectName"), target: exObject }),
        new Focus2({ kind: FocusKind("ExObjectComponent"), target: exObject }),
      ];

      const vv1 = yield* Effect.all(
        exObject.componentParameterProperties_.items.map((p) =>
          createFocusList.forProperty(p)
        )
      );
      const vv2 = yield* Effect.all(
        exObject.basicProperties.items.map((p) =>
          createFocusList.forProperty(p)
        )
      );
      const vv3 = yield* createFocusList.forProperty(
        exObject.cloneCountProperty
      );

      results.push(...vv1.flat());
      results.push(...vv2.flat());
      results.push(...vv3);
      return results;
    });
  },

  forProperty(property: Property): Stream.Stream<Focus2[]> {
    return Effect.gen(function* () {
      const results = [
        new Focus2({ kind: FocusKind("PropertyName"), target: property }),
      ];

      const vv = yield* createFocusList.forExpr(yield* property.expr.get);
      results.push(...vv);
      return results;
    });
  },

  forExpr(expr: Expr): Stream.Stream<Focus2[]> {
    return Effect.gen(function* () {
      const results = [
        new Focus2({ kind: FocusKind("Expr"), target: expr }),
      ];

      if (expr.type === "Expr/Call") {
        const vv = yield* Effect.all(
          expr.args.items.map((c) => createFocusList.forExpr(c))
        );
        results.push(...vv.flat());
      }

      return results;
    });
  },
};
