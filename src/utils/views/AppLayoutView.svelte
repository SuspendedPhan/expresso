<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import { activeWindowToSvelteComponent } from "../utils/ViewUtils";
  import NavMenuView from "./NavMenuView.svelte";
  import { ViewMode } from "src/main-context/MainViewContext";

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

    <div class="shrink-1 basis-1/2" style="overflow: auto;">
      <svelte:component this={$activeWindow$} {ctx} />
    </div>
    <div class="shrink-1 basis-1/2">
      <SceneView {ctx} />
    </div>
  </div>
{:else if $viewMode$ === ViewMode.MainWindowMaximized}
  <div class="flex h-full">
    <NavMenuView {ctx} />

    <div class="grow-1 w-full" style="overflow: auto;">
      <svelte:component this={$activeWindow$} {ctx} />
    </div>
  </div>
{:else if $viewMode$ === ViewMode.SceneWindowMaximized}
  <div class="flex h-full">
    <NavMenuView {ctx} />

    <div class="grow-1">
      <SceneView {ctx} />
    </div>
  </div>
{/if}

<style></style>
