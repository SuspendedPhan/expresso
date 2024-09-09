<script lang="ts">
  import { type NavItem } from "../utils/Nav";
  import { map, of } from "rxjs";

  export let ctx: MainContext;
  export let item: NavItem;

  const active$ = ctx.viewCtx.activeWindow$.pipe(map((w) => w === item.window));
  const sectionFocused$ = of(false);
</script>

<div class="indicator">
  <span
    class:hidden={!$sectionFocused$}
    class="indicator-item indicator-right indicator-bottom badge underline text-xs"
    >{item.label[0]}</span
  >
  <button
    class="{item.iconClasses} block btn btn-sm w-8 h-8 p-0 shadow-none focus:outline-none"
    class:bg-neutral={$active$}
    class:text-neutral-content={$active$}
    class:hover:bg-neutral={$active$}
    on:click={() => ctx.viewCtx.activeWindow$.next(item.window)}
  ></button>
</div>
