<script lang="ts">
  import "./app.css";
  import { BehaviorSubject, combineLatest, map } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { NumberExpr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";

  const goModule$ = GoModuleLoader.get$();
  const expr = new BehaviorSubject(new NumberExpr(0));

  const result = combineLatest([goModule$, expr]).pipe(
    map(([goModule, expr]) => {
      const evaluator = goModule.createEvaluator(expr);
      return evaluator.eval();
    })
  );

  function handleSelect(event: CustomEvent<NumberExpr>) {
    expr.next(event.detail);
  }
</script>

<main>
  <div>Hello World</div>
  <div>{$result}</div>

  <ExprCommand on:select={handleSelect} />
</main>

<style></style>
