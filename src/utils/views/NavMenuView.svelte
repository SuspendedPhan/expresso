<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavItemView from "./NavItemView.svelte";

  export let ctx: MainContext;
</script>

<ul class="bg-base-200 h-full menu">
  <div class="p-4 py-2 flex items-center gap-8">
    <div class="text-lg w-max">Hello World</div>
    <button class="fa-solid fa-bars"></button>
  </div>

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
