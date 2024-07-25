<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavItemView from "./NavItemView.svelte";

  export let ctx: MainContext;
</script>

<ul class:menu={true} class="bg-base-200 h-full">
  {#each ctx.viewCtx.navSections as section}
    <div class="menu-title text-base-content font-normal">{section.title}</div>
    <div class="divider m-0"></div>
    {#each section.navItems as item}
      <li>
        <NavItemView {ctx} {item}></NavItemView>
      </li>
    {/each}
  {/each}
</ul>
