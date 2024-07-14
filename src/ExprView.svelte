<script lang="ts">
  import { BehaviorSubject } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Expr } from "./ExprFactory";
  import { type Selectable } from "./utils/Selection";
  import { loggedMethod } from "./logger/LoggerDecorator";
  import Logger from "./logger/Logger";

  export let ctx: MainContext;
  export let expr$: BehaviorSubject<Expr>;

  let text: string;
  let args: readonly BehaviorSubject<Expr>[] = [];

  const selectable$ = new BehaviorSubject<Selectable>(expr$.value);
  expr$.subscribe((v) => selectable$.next(v));

  function handleSelect(e: CustomEvent<string>): void {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      ctx.replacer.replaceWithNumberExpr(expr$, value);
    } else if (text === "+") {
      ctx.replacer.replaceWithCallExpr(expr$);
    }
  }

  class ExprView {
    @loggedMethod
    static setup() {
      const logger = Logger.logger();
      Logger.logCallstack();

      expr$.subscribe((expr) => {
        logger.log("subscribe", expr.id);
        if (expr.type === "NumberExpr") {
          text = expr.value.toString();
        } else if (expr.type === "CallExpr") {
          text = "+";
        }

        if (expr.type === "CallExpr") {
          args = expr.args;
        }
      });
    }
  }

  ExprView.setup();
</script>

<main>
  <SelectableView {ctx} object$={selectable$}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg}
        <svelte:self expr$={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
