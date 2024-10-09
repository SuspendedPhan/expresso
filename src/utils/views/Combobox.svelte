<script lang="ts" generics="T extends { label: string }">
  import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
  } from "@floating-ui/dom";
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import {
    type ComboboxPropsIn,
    type ComboboxState,
  } from "src/utils/views/Combobox";
  import Divider from "src/utils/views/Divider.svelte";
  import { onMount } from "svelte";

  export let propsIn: ComboboxPropsIn<T>;

  let query: ComboboxState<T>["query"];
  let optionImpls: ComboboxState<T>["optionImpls"];
  let onInput: ComboboxState<T>["onInput"];
  let onKeydown: ComboboxState<T>["onKeydown"];
  let ready = false;

  let inputEl: HTMLInputElement;
  let rootEl: HTMLElement;
  let childEl: HTMLElement;

  let cleanup: () => void;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const state = yield* propsIn.createState();
      query = state.query;
      optionImpls = state.optionImpls;
      onInput = state.onInput;
      onKeydown = state.onKeydown;

      // console.log("Combobox ready");
      // console.log(optionImpls);
      // optionImpls.subscribe((options) => {
      // todp: why is this getting logged multiple times?
      // console.log(options);
      // });
      ready = true;

      yield* Effect.sleep(0);
      childEl.showPopover();

      function updatePosition() {
        computePosition(rootEl, childEl, {
          placement: "bottom-start",
          strategy: "fixed",
          middleware: [offset(10), flip(), shift({ padding: 5 })],
        }).then(({ x, y }) => {
          Object.assign(childEl.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      }

      cleanup = autoUpdate(rootEl, childEl, updatePosition);
    })
  );

  onMount(() => {
    inputEl.focus();
    return () => {
      cleanup();
    };
  });
</script>

{#if ready}
  <div bind:this={rootEl}>
    <div
      class="p-2 bg-white ring rounded-sm flex flex-col gap-2"
      style="inset: unset"
      popover="manual"
      bind:this={childEl}
    >
      <div>
        <input
          class="outline-none"
          type="text"
          value={$query}
          on:input={onInput}
          bind:this={inputEl}
          on:keydown={onKeydown}
        />
      </div>
      <Divider />
      <div>
        {#each $optionImpls as option_}
          <div class:bg-neutral-content={option_.isFocused}>
            <button on:click={() => option_.select()}
              >{option_.option.label}</button
            >
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
