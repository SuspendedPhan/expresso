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

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    expr.next(new NumberExpr(value));
  }

  function handleSelect(event: CustomEvent<NumberExpr>) {
    expr.next(event.detail);
  }
</script>

<main>
  <div>Hello World</div>
  <input type="number" value={$expr.getValue()} on:input={handleInput} />
  <div>{$result}</div>

  <ExprCommand on:select={handleSelect} />
</main>

<style></style>
