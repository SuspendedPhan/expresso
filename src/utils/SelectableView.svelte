<script lang="ts">
  import { type Selectable } from "./Selection";
  import MainContext from "../MainContext";
  import { map, share } from "rxjs";
  import Logger from "./Logger";

  export let object: Selectable;
  export let ctx: MainContext;

  const logger = Logger.topic("SelectableView.svelte");
  Logger.onlyAllowTopics(["SelectableView.svelte", "Selection.ts"]);
  Logger.logToConsole();

  const selected$ = ctx.selection.getSelectedObject$().pipe(
    map((o) => o === object),
    share()
  );

  selected$.subscribe((selected) => {
    logger.log("selected", selected);
  });
</script>

<main
  class="border border-black"
  class:border-solid={$selected$}
  class:border-transparent={!$selected$}
>
  <slot />
</main>
