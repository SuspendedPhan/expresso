<script lang="ts">
  import { combineLatest, switchMap } from "rxjs";
  import CanvasView from "src/canvas/CanvasView.svelte";
  import { onMount } from "svelte";
  // import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import { activeWindowToSvelteComponent } from "../utils/ViewUtils";
  import NavMenuView from "./NavMenuView.svelte";

  import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";
  import { ViewCtx, ViewMode } from "src/ctx/ViewCtx";
  import { FirebaseAuthentication } from "src/utils/persistence/FirebaseAuthentication";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";
  import { RxFns } from "src/utils/utils/Utils";
  import OverlayContainer from "src/utils/views/OverlayContainer.svelte";

  const log55 = log5("AppLayoutView.svelte");

  let activeWindowSvelteComponent: any;
  let viewMode: ViewMode;

  RxFns.onMount$()
    .pipe(
      switchMap(() => {
        log55.debug("onMount");
        return DexRuntime.runPromise(ViewCtx);
      }),
      switchMap((viewCtx) => {
        log55.debug("viewCtx", viewCtx);
        return combineLatest([viewCtx.activeWindow$, viewCtx.viewMode$]);
      })
    )
    .subscribe(([activeWindow, viewMode2]) => {
      log55.debug("activeWindow", activeWindow);
      activeWindowSvelteComponent = activeWindowToSvelteComponent(activeWindow);
      viewMode = viewMode2;
    });

  onMount(() => {
    FirebaseAuthentication.init();
  });
</script>

<div id="firebaseui-auth-container"></div>

{#if viewMode === ViewMode.Default}
  <div class="flex h-full">
    <NavMenuView />

    <OverlayScrollbarsComponent defer class="shrink basis-1/2">
      <svelte:component this={activeWindowSvelteComponent} />
    </OverlayScrollbarsComponent>

    <div class="shrink basis-1/2 min-w-0">
      <CanvasView />
    </div>
  </div>
{:else if viewMode === ViewMode.MainWindowMaximized}
  <div class="flex h-full">
    <NavMenuView />

    <div class="grow-1 w-full" style="overflow: auto;">
      <svelte:component this={activeWindowSvelteComponent} />
    </div>
  </div>
{:else if viewMode === ViewMode.CanvasWindowMaximized}
  <div class="flex h-full">
    <NavMenuView />

    <div class="grow-1">
      <CanvasView />
    </div>
  </div>
{/if}

<OverlayContainer />

<style></style>
