<script lang="ts">
  import { map } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import CanvasView from "src/canvas/CanvasView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import { activeWindowToSvelteComponent } from "../utils/ViewUtils";
  import NavMenuView from "./NavMenuView.svelte";

  import OverlayContainer from "src/utils/views/OverlayContainer.svelte";
  import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";

  export let ctx: MainContext;

  const activeWindow$ = ctx.viewCtx.activeWindow$.pipe(
    map((w) => {
      const sc = activeWindowToSvelteComponent(w);
      return sc;
    })
  );

  onMount(() => {
    FirebaseAuthentication.init();
  });

  const viewMode$ = ctx.viewCtx.viewMode$;
</script>

<div id="firebaseui-auth-container"></div>

{#if $viewMode$ === ViewMode.Default}
  <div class="flex h-full">
    <NavMenuView {ctx} />

    <OverlayScrollbarsComponent defer class="shrink-1 basis-1/2">
      <svelte:component this={$activeWindow$} {ctx} />
    </OverlayScrollbarsComponent>
    <div class="shrink-1 basis-1/2">
      <CanvasView {ctx} />
    </div>
  </div>
{:else if $viewMode$ === ViewMode.MainWindowMaximized}
  <div class="flex h-full">
    <NavMenuView {ctx} />

    <div class="grow-1 w-full" style="overflow: auto;">
      <svelte:component this={$activeWindow$} {ctx} />
    </div>
  </div>
{:else if $viewMode$ === ViewMode.CanvasWindowMaximized}
  <div class="flex h-full">
    <NavMenuView {ctx} />

    <div class="grow-1">
      <CanvasView {ctx} />
    </div>
  </div>
{/if}

<OverlayContainer {ctx} />

<style></style>
