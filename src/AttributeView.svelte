<script lang="ts">
  import { Observable, switchMap } from "rxjs";
  import type { Attribute } from "./ExObjectFactory";
  import ExprView from "./ExprView.svelte";
  import { loggedMethod } from "./logger/LoggerDecorator";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let attribute$: Observable<Attribute>;

  class AttributeView {
    @loggedMethod
    static expr$() {
      return attribute$.pipe(switchMap((attr) => attr.expr$));
    }
  }

  const expr$ = AttributeView.expr$();
</script>

<main>
  <SelectableView {ctx} object$={attribute$}>
    <div>Attribute</div>
    <ExprView {ctx} {expr$} />
  </SelectableView>
</main>
