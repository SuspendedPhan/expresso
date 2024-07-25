<script lang="ts">
  import { Window } from "src/main-context/MainViewContext";
  import NavItemView from "./NavItemView.svelte";
  import MainContext from "src/main-context/MainContext";
  import { map } from "rxjs";
  export let ctx: MainContext;
  let clazz: string = "";
  export { clazz as class };

  const focused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "ProjectNav"));
</script>

<ul class="menu bg-base-200 h-full {clazz}">
  <div class="p-2" class:ring={$focused$}>
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
  </div>

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
