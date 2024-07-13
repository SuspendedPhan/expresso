<script lang="ts">
  import ExprView from "./ExprView.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Attribute } from "./ExprFactory";
  import { BehaviorSubject, switchMap, tap } from "rxjs";
  import { type Selectable } from "./utils/Selection";

  export let ctx: MainContext;
  export let attribute$: BehaviorSubject<Attribute>;

  const selectable$ = new BehaviorSubject<Selectable>(attribute$.value);
  attribute$.subscribe((v) => selectable$.next(v));

  const expr$ = new BehaviorSubject(attribute$.value.expr$.value);
  attribute$
    .pipe(
      switchMap((attr) => {
        console.log("AttributeView.switchMap");
        return attr.expr$;
      }),
      tap((v) => console.log("AttributeView.tap", v.type))
    )
    .subscribe((v) => expr$.next(v));
</script>

<main>
  <SelectableView {ctx} object$={selectable$}>
    <div>Attribute</div>
    <ExprView {ctx} {expr$} />
  </SelectableView>
</main>
