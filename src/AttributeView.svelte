<script lang="ts">
  import ExprView from "./ExprView.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Attribute, Expr } from "./ExprFactory";
  import { BehaviorSubject } from "rxjs";
  import { type Selectable } from "./utils/Selection";
  import { loggedMethod } from "./logger/LoggerDecorator";
  import Logger from "./logger/Logger";

  export let ctx: MainContext;
  export let attribute$: BehaviorSubject<Attribute>;

  const selectable$ = new BehaviorSubject<Selectable>(attribute$.value);
  attribute$.subscribe((v) => selectable$.next(v));

  let expr$: BehaviorSubject<Expr> | null = null;

  class AttributeView {
    @loggedMethod
    static setup() {
      Logger.logCallstack();
      const logger = Logger.logger();
      attribute$.subscribe((attribute) => {
        logger.log("subscribe", attribute);
        expr$ = attribute.expr$;
      });
    }
  }
  AttributeView.setup();
</script>

<main>
  <SelectableView {ctx} object$={selectable$}>
    <div>Attribute</div>
    {#if expr$}
      <ExprView {ctx} {expr$} />
    {/if}
  </SelectableView>
</main>
