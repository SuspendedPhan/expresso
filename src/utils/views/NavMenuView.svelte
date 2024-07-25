<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavSectionView from "./NavSectionView.svelte";

  export let ctx: MainContext;
</script>

<ul class="bg-base-200 h-full menu">
  <div class="p-4 pr-0 py-2 flex items-center gap-8">
    <div class="text-lg w-max">Hello World</div>
    <button class="fa-solid fa-bars btn btn-sm shadow-none"></button>
  </div>

  {#each ctx.viewCtx.navSections as section}
    <div class="divider m-0"></div>
    <NavSectionView {ctx} {section}></NavSectionView>
  {/each}
</ul>
