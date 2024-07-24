<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import { activeWindowToSvelteComponent } from "../utils/ViewUtils";
  import NavMenuView from "./NavMenuView.svelte";

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
</script>

<div id="firebaseui-auth-container"></div>

<div class="flex h-full">
  <NavMenuView {ctx} class="shrink-0" />

  <div class="shrink-1 basis-1/2" style="overflow: auto;">
    <svelte:component this={$activeWindow$} {ctx} />
  </div>
  <div class="shrink-1 basis-1/2">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
