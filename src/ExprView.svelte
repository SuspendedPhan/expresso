<script lang="ts">
  import { map, Observable } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import { ExprType, type Expr } from "./ExObjectFactory";
  import { loggedMethod } from "./logger/LoggerDecorator";

  export let ctx: MainContext;
  export let expr$: Observable<Expr>;

  class ExprView {
    @loggedMethod
    static text$() {
      return expr$.pipe(
        map((expr) => {
          switch (expr.exprType) {
            case ExprType.NumberExpr:
              return expr.value.toString();
            case ExprType.CallExpr:
              return "+";
            default:
              return "";
          }
        })
      );
    }

    @loggedMethod
    static args$() {
      return expr$.pipe(
        map((expr) => {
          if (expr.exprType === ExprType.CallExpr) {
            return expr.args;
          }
          return [];
        })
      );
    }

    @loggedMethod
    static handleSelect$() {
      return expr$.pipe(
        map((expr) => {
          return (e: CustomEvent<string>) => {
            const text = e.detail;
            const value = parseFloat(text);
            if (!isNaN(value)) {
              ctx.mutator.replaceWithNumberExpr(expr, value);
            } else if (text === "+") {
              ctx.mutator.replaceWithCallExpr(expr);
            }
          };
        })
      );
    }
  }

  const text$ = ExprView.text$();
  const args$ = ExprView.args$();
  const handleSelect$ = ExprView.handleSelect$();
</script>

<main>
  <SelectableView {ctx} object$={expr$}>
    <span>Expr</span>
    <span>{$text$}</span>
    <ExprCommand on:select={$handleSelect$} />

    <div class="pl-2">
      {#each $args$ as arg$}
        <svelte:self expr$={arg$} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
