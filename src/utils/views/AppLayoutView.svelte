<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import EditorView from "./EditorView.svelte";
  import NavItemView from "./NavItemView.svelte";
  import { Window } from "src/main-context/MainViewContext";
  import NavMenuView from "./NavMenuView.svelte";

  export let ctx: MainContext;

  export let activeWindow = EditorView;

  onMount(() => {
    FirebaseAuthentication.init();
  });
</script>

<div id="firebaseui-auth-container"></div>

<div class="flex h-full">
  <NavMenuView {ctx} class="shrink-0" />

  <div class="shrink-1 basis-1/2" style="overflow: auto;">
    <svelte:component this={activeWindow} {ctx} />
  </div>
  <div class="shrink-1 basis-1/2">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
