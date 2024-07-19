<script lang="ts">
  import AttributeView from "./AttributeView.svelte";
  import type { Attribute } from "src/ex-object/ExObject";
  import Logger from "../utils/logger/Logger";
  import { loggedMethod } from "src/utils/logger/LoggerDecorator";
  import type MainContext from "src/main-context/MainContext";
  import SceneView from "../scene/SceneView.svelte";
  import HydrationTest from "src/utils/utils/HydrationTest";
  import Main from "src/utils/utils/Main";

  let ctx: MainContext | null = null;
  let attribute: Attribute | null = null;
  let rehydratedAttribute: Attribute | null = null;
  let result = -1;

  const main$ = Main.setup$();
  main$.subscribe((main) => MainView.setup(main));

  class MainView {
    @loggedMethod
    static setup(main: Main) {
      const logger = Logger.logger();

      ctx = main.ctx;
      attribute = main.attribute;

      HydrationTest.test(main, ctx).subscribe((a) => {
        if (a === null) {
          return;
        }

        logger.log("Main.subscribe", a.id);
        rehydratedAttribute = a;
      });
    }
  }

  document.addEventListener("mousedown", () => {
    ctx?.selection.select(null);
  });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute === null || rehydratedAttribute === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    {#key attribute.id}
      <AttributeView {ctx} {attribute} />
    {/key}

    {#key rehydratedAttribute.id}
      <AttributeView {ctx} attribute={rehydratedAttribute} />
    {/key}
    <SceneView {ctx} />
  {/if}
</main>

<style></style>
