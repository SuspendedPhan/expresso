<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import EditorView from "./EditorView.svelte";

  export let ctx: MainContext;

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
    <li><button class="active">Editor</button></li>
    <li><button>Functions</button></li>
    <div class="divider my-0"></div>
    <div class="menu-title">Library</div>
    <li><button>Projects</button></li>
    <li><button>Functions</button></li>
  </ul>

  <div class="shrink-1 basis-1/2" style="overflow: auto;">
    <EditorView {ctx} />
  </div>
  <div class="shrink-1 basis-1/2">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
