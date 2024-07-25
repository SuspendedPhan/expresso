<script lang="ts">
  import { Window } from "src/main-context/MainViewContext";
  import NavItemView from "./NavItemView.svelte";
  import MainContext from "src/main-context/MainContext";
  import { first, map } from "rxjs";
  export let ctx: MainContext;
  let clazz: string = "";
  export { clazz as class };

  const projectNavFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "ProjectNav"));

  const libraryNavFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "LibraryNav"));

  function toggleNav() {
    ctx.viewCtx.navCollapsed$.pipe(first()).subscribe((collapsed) => {
      ctx.viewCtx.navCollapsed$.next(!collapsed);
    });
  }

  const navCollapsed$ = ctx.viewCtx.navCollapsed$;
</script>

<ul class:menu={!$navCollapsed$} class="menu bg-base-200 h-full {clazz}">
  <div class="p-2" class:ring={$projectNavFocused$}>
    <div class=" w-full flex justify-between pr-0 items-center gap-2">
      {#if !$navCollapsed$}
        <span class="menu-title text-base-content font-normal">Hello World</span
        >
      {/if}

      {#if $projectNavFocused$}
        <button class="kdb bg-base-300 w-6 h-6 underline">X</button>
      {:else}
        <button class="fa-solid fa-bars w-6 h-6" on:click={toggleNav}></button>
      {/if}
    </div>
    <div class="divider m-0"></div>
    {#if !$navCollapsed$}
      <div class="menu-title">Project</div>
    {/if}
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
  <div class="p-2" class:ring={$libraryNavFocused$}>
    {#if !$navCollapsed$}
      <div class="menu-title">
        <span class:underline={$projectNavFocused$}>L</span>ibrary
      </div>
    {/if}
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
