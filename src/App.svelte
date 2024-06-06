<script lang="ts">
  import "./app.css";
  import { BehaviorSubject, combineLatest, map } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { NumberExpr, PrimitiveFunctionCallExpr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import ExprView from "./ExprView.svelte";

  const goModule$ = GoModuleLoader.get$();
  const expr = new PrimitiveFunctionCallExpr([
    new NumberExpr(1),
    new NumberExpr(2),
  ]);
  const expr$ = new BehaviorSubject(expr);

  const result = combineLatest([goModule$, expr$]).pipe(
    map(([goModule, expr]) => {
      const evaluator = goModule.createEvaluator(expr);
      return evaluator.eval();
    })
  );
</script>

<main>
  <div>Hello World</div>
  <div>{$result}</div>

  <ExprView expr={$expr$} />
</main>

<style></style>
