<script lang="ts">
  import type { CustomComponentParameter } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import HugInput from "./HugInput.svelte";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import { map } from "rxjs";

  export let ctx: MainContext;
  export let parameter: CustomComponentParameter;
  const name$ = parameter.name$;
  const isEditing$ = ctx.focusCtx
    .mapFocus2$(FocusKind.is.ComponentParameter)
    .pipe(map());

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value === "") {
      parameter.name$.next("a");
    } else {
      parameter.name$.next(target.value);
    }
  }
</script>

<HugInput on:input={handleInput} value={$name$}></HugInput>
