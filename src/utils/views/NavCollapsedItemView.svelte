<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { type NavItem } from "../utils/Nav";
  import { map } from "rxjs";

  export let ctx: MainContext;
  export let item: NavItem;

  const active$ = ctx.viewCtx.activeWindow$.pipe(map((w) => w === item.window));
</script>

<button
  class="{item.iconClasses} block btn btn-sm w-8 h-8 p-0 shadow-none focus:outline-none"
  class:bg-neutral={$active$}
  class:text-neutral-content={$active$}
  class:hover:bg-neutral={$active$}
  on:click={() => ctx.viewCtx.activeWindow$.next(item.window)}
></button>
