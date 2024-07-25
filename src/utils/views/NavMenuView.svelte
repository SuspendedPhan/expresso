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

  const projectNavFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "ProjectNav"));

  const libraryNavFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "LibraryNav"));
</script>

<ul class="menu bg-base-200 h-full {clazz}">
  <div class="p-2" class:ring={$focused$}>
    <div class="menu-title">
      <span>Hello World</span>
    </div>
    <li>
      <NavItemView
        {ctx}
        window={Window.ProjectEditor}
        label="Editor"
        sectionFocused={$projectNavFocused$}
      ></NavItemView>
    </li>
    <li>
      <NavItemView
        {ctx}
        window={Window.ProjectComponentList}
        label="Components"
        sectionFocused={$projectNavFocused$}
      ></NavItemView>
    </li>
    <li>
      <NavItemView
        {ctx}
        window={Window.ProjectFunctionList}
        label="Functions"
        sectionFocused={$projectNavFocused$}
      ></NavItemView>
    </li>
  </div>

  <div class="divider my-0"></div>
  <div class="p-2">
    <div class="menu-title">Library</div>
    <li>
      <NavItemView
        {ctx}
        window={Window.LibraryProjectList}
        label="Projects"
        sectionFocused={$libraryNavFocused$}
      ></NavItemView>
    </li>
    <li>
      <NavItemView
        {ctx}
        window={Window.LibraryComponentList}
        label="Components"
        sectionFocused={$libraryNavFocused$}
      ></NavItemView>
    </li>
    <li>
      <NavItemView
        {ctx}
        window={Window.LibraryFunctionList}
        label="Functions"
        sectionFocused={$libraryNavFocused$}
      ></NavItemView>
    </li>
  </div>
</ul>
