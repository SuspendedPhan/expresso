<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavCollapsedSectionView from "./NavCollapsedSectionView.svelte";
  import NavSectionView from "./NavSectionView.svelte";

  export let ctx: MainContext;

  const navCollapsed$ = ctx.viewCtx.navCollapsed$;

  function toggleNav() {
    ctx.viewCtx.navCollapsed$.next(!ctx.viewCtx.navCollapsed$.value);
  }
</script>

{#if $navCollapsed$}
  <div class="p-2 bg-base-200 flex flex-col">
    <button
      class="fa-solid fa-bars block btn btn-sm w-8 h-8 p-0 shadow-none"
      on:click={toggleNav}
    ></button>

    {#each ctx.viewCtx.navSections as section}
      <div class="divider m-0"></div>
      <NavCollapsedSectionView {ctx} {section}></NavCollapsedSectionView>
    {/each}
  </div>
{:else}
  <ul class="bg-base-200 h-full menu">
    <div class="p-4 pr-0 py-2 flex items-center gap-8">
      <div class="pl-1 text-lg w-max">Hello World</div>
      <button
        class="fa-solid fa-bars btn btn-sm shadow-none"
        on:click={toggleNav}
      ></button>
    </div>

    {#each ctx.viewCtx.navSections as section}
      <div class="divider m-0"></div>
      <NavSectionView {ctx} {section}></NavSectionView>
    {/each}
  </ul>
{/if}
