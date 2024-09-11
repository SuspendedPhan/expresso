
import {
  dexVariantTyped,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

// ----------------
// Variant declaration
// ----------------

type Expr_ = {
  // Rename step 2: Rename this Number second.
  Number: {
    id: string;
    value: number;
  };
  CallExpr: {
    id: string;
    args: Expr[];
  };
};

const Expr = dexVariantTyped<Expr_>({
  // Rename step 1: Rename this Number first.
  Number: pass,
  CallExpr: pass,
});

type Expr = VariantOf<typeof Expr>;
type ExprKind = DexVariantKind<typeof Expr>;

// ----------------
// Usage
// ----------------

// Rename step 3: Observe that `ExprKind["Number"]` is renamed, as well as `Expr.Number`.
const a: ExprKind["Number"] = Expr.Number({ id: "1", value: 1 });
const b: ExprKind["Number"] = Expr.Number({ id: "2", value: 2 });
const c: ExprKind["CallExpr"] = Expr.CallExpr({ id: "3", args: [a, b] });

const m = c as Expr;
console.log(m);
// ExprCosmos.matcher(m).with({
//   Number: ({ id, value }) => console.log(`Number: ${id}, ${value}`),
//   CallExpr: ({ id, args }) => console.log(`CallExpr: ${id}, ${args}`),
// });

// ExprCosmos.matcher(m)
//   .when(Expr.Number, ({ id, value }) => console.log(`Number: ${id}, ${value}`))
//   .when(Expr.CallExpr, ({ id, args }) => console.log(`CallExpr: ${id}, ${args}`))
//   .complete();

// ExprCosmos.matcher(m)
//   .with({
//     Number: ({ id, value }) => console.log(`Number: ${id}, ${value}`),
//     CallExpr: ({ id, args }) => console.log(`CallExpr: ${id}, ${args}`),
//   });

// ExprCosmos.match(m, {
//   Number: ({ id, value }) => console.log(`Number: ${id}, ${value}`),
//   CallExpr: ({ id, args }) => console.log(`CallExpr: ${id}, ${args}`),
// });

// .with({
//   Number: ({ id, value }) => console.log(`Number: ${id}, ${value}`),
//   CallExpr: ({ id, args }) => console.log(`CallExpr: ${id}, ${args}`),
// })
// .complete();
