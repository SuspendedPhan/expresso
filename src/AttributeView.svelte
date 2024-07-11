<script lang="ts">
  import ExprView from "./ExprView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Attribute } from "./ExprFactory";
  import { BehaviorSubject } from "rxjs";
  import { type Selectable } from "./utils/Selection";

  export let ctx: MainContext;
  export let attribute$: BehaviorSubject<Attribute>;

  const selectable$ = new BehaviorSubject<Selectable>(attribute$.value);
  attribute$.subscribe((v) => selectable$.next(v));

  const expr$ = attribute$.value.expr$;
  expr$.subscribe((v) => Logger.file("AttributeView").log("expr$", v));
</script>

<main>
  <SelectableView {ctx} object$={selectable$}>
    <div>Attribute</div>
    {#key $expr$}
      <ExprView {ctx} {expr$} />
    {/key}
  </SelectableView>
</main>
