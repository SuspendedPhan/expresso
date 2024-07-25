<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavItemView from "./NavItemView.svelte";

  export let ctx: MainContext;
</script>

<ul class:menu={true} class="bg-base-200 h-full">
  {#each ctx.viewCtx.navSections as section}
    <div class="divider m-0"></div>
    <div class="menu-title">{section.title}</div>

    {#each section.navItems as item}
      <li>
        <NavItemView {ctx} {item}></NavItemView>
      </li>
    {/each}
  {/each}
</ul>
