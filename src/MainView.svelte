<script lang="ts">
  import { combineLatest, map } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./Logger";

  const goModule$ = GoModuleLoader.get$();
  const attribute = new Attribute();
  const expr$ = attribute.getExpr$();

  const result = combineLatest([goModule$, expr$]).pipe(
    map(([goModule, expr]) => {
      Logger.allow("MainView");
      Logger.topic("MainView").log("expr", expr);
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
