<script lang="ts">
  import ExprView from "./ExprView.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Attribute } from "./ExprFactory";
  import { BehaviorSubject, switchMap } from "rxjs";
  import { loggedMethod } from "./logger/LoggerDecorator";

  export let ctx: MainContext;
  export let attribute$: BehaviorSubject<Attribute>;

  class AttributeView {
    @loggedMethod
    static expr$() {
      return attribute$.pipe(switchMap((attr) => attr.expr$));
    }
  }

  const expr$ = AttributeView.expr$();
</script>

<main>
  <SelectableView {ctx} object$={expr$}>
    <div>Attribute</div>
    <ExprView {ctx} {expr$} />
  </SelectableView>
</main>
