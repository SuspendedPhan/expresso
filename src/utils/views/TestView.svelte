<script lang="ts">
  import { filter, map, switchMap } from "rxjs";

  import PropertyView from "src/utils/views/PropertyView.svelte";

  const property$ = ctx.projectCtx.currentProject$.pipe(
    switchMap((project) => project.rootExObjects$),
    filter((r) => r.length > 0),
    map((r) => r[0]!),
    map((r) => r.cloneCountProperty)
  );
</script>

{#if $property$}
  <PropertyView {ctx} property={$property$} />
{/if}
