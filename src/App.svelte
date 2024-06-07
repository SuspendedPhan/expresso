<script lang="ts">
  import "./app.css";
  import { BehaviorSubject, combineLatest, map } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { Attribute, NumberExpr, PrimitiveFunctionCallExpr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import ExprView from "./ExprView.svelte";
  import AttributeView from "./AttributeView.svelte";

  const goModule$ = GoModuleLoader.get$();
  const attribute = new Attribute();
  const expr$ = attribute.getExpr$();

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

  <AttributeView {attribute} />
</main>

<style></style>
