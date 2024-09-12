<script lang="ts">
  import { map, of, switchAll, switchMap } from "rxjs";
  import { ExprFactory } from "src/ex-object/Expr";
  import { Property, PropertyFactory } from "src/ex-object/Property";
  import { ExObjectFocus } from "src/focus/ExObjectFocus";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";

  import { rxEquals, RxFns } from "src/utils/utils/Utils";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  import { isType } from "variant";

  const log55 = log5("PropertyView.svelte");

  export let property: Property;

  const name$ = Property.Methods(property).getName$();

  const expr$ = property.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));

  const isNumberExpr$ = expr$.pipe(map(isType(ExprFactory.Number)));

  let isFocused = false;
  RxFns.onMount$()
    .pipe(
      switchMap(() => DexRuntime.runPromise(ExObjectFocus.propertyFocus$)),
      switchAll(),
      rxEquals(property)
    )
    .subscribe((isFocused2) => {
      isFocused = isFocused2;
    });

  const editingName$ = of(false);

  // todp
  function handleNameInput(event: Event) {
    const currentTarget = event.currentTarget as HTMLInputElement;
    const name = currentTarget.value;
    if (!isType(property, PropertyFactory.BasicProperty)) {
      throw new Error("Cannot edit name of non-basic property");
    }

    property.name$.next(name);
  }
</script>

<div class:flex={$isNumberExpr$} class="items-center font-mono">
  <div class="flex flex-row">
    <FocusView focused={isFocused} class="w-max grow-0">
      <HugInput
        value={$name$}
        isEditing={$editingName$}
        on:input={handleNameInput}
      />
    </FocusView>
    <pre class="text-style-secondary"> = </pre>
  </div>

  {#key $exprId$}
    <RootExprView expr={$expr$} />
  {/key}
</div>
