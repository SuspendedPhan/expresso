<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import EditorView from "./EditorView.svelte";
  import NavItemView from "./NavItemView.svelte";
  import { Window } from "src/main-context/MainViewContext";

  export let ctx: MainContext;

  export let activeWindow = EditorView;

  onMount(() => {
    FirebaseAuthentication.init();
  });
</script>

<div id="firebaseui-auth-container"></div>

<div class="flex">
  <ul class="shrink-0 menu bg-base-200 p-4">
    <div class="menu-title">
      <span>Hello World</span>
    </div>
    <li>
      <NavItemView {ctx} window={Window.ProjectEditor}>Editor</NavItemView>
    </li>
    <li>
      <NavItemView {ctx} window={Window.ProjectFunctionList}
        >Functions</NavItemView
      >
    </li>
    <div class="divider my-0"></div>
    <div class="menu-title">Library</div>
    <li>
      <NavItemView {ctx} window={Window.LibraryProjectList}
        >Projects</NavItemView
      >
    </li>
    <li>
      <NavItemView {ctx} window={Window.LibraryFunctionList}
        >Functions</NavItemView
      >
    </li>
  </ul>

  <div class="shrink-1 basis-1/2" style="overflow: auto;">
    <svelte:component this={activeWindow} {ctx} />
  </div>
  <div class="shrink-1 basis-1/2">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
