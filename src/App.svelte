<script lang="ts">
  import { BehaviorSubject, combineLatest, map } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { NumberExpr } from "./Domain";

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
</script>

<main>
  <div>Hello World</div>
  <input type="number" value={$expr.getValue()} on:input={handleInput} />
  <div>{$result}</div>
</main>
