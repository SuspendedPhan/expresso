<script lang="ts">
  import { filter, map, switchMap } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import GoogleDriveLogin2 from "src/utils/views/GoogleDriveLogin2.svelte";
  import PropertyView from "src/utils/views/PropertyView.svelte";

  export let ctx: MainContext;
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

<GoogleDriveLogin2 />
