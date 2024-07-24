<script lang="ts">
  import { Window } from "src/main-context/MainViewContext";
  import NavItemView from "./NavItemView.svelte";
  export let ctx: any;
  let clazz: string = "";
  export { clazz as class };
</script>

<ul class="menu bg-base-200 p-4 h-full {clazz}">
  <div class="menu-title">
    <span>Hello World</span>
  </div>
  <li>
    <NavItemView {ctx} window={Window.ProjectEditor}>Editor</NavItemView>
  </li>
  <li>
    <NavItemView {ctx} window={Window.ProjectComponentList}
      >Components</NavItemView
    >
  </li>
  <li>
    <NavItemView {ctx} window={Window.ProjectFunctionList}
      >Functions</NavItemView
    >
  </li>
  <div class="divider my-0"></div>
  <div class="menu-title">Library</div>
  <li>
    <NavItemView {ctx} window={Window.LibraryProjectList}>Projects</NavItemView>
  </li>
  <li>
    <NavItemView {ctx} window={Window.LibraryComponentList}
      >Components</NavItemView
    >
  </li>
  <li>
    <NavItemView {ctx} window={Window.LibraryFunctionList}
      >Functions</NavItemView
    >
  </li>
</ul>
