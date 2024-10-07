<script lang="ts" generics="T extends { label: string }">
  import { onMount } from "svelte";
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import {
    type ComboboxPropsIn,
    type ComboboxState,
  } from "src/utils/views/Combobox";
  import Divider from "src/utils/views/Divider.svelte";

  export let propsIn: ComboboxPropsIn<T>;

  let query: ComboboxState<T>["query"];
  let optionImpls: ComboboxState<T>["optionImpls"];
  let onInput: ComboboxState<T>["onInput"];
  let onKeydown: ComboboxState<T>["onKeydown"];
  let ready = false;

  let inputEl: HTMLInputElement;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const state = yield* propsIn.createState();
      query = state.query;
      optionImpls = state.optionImpls;
      onInput = state.onInput;
      onKeydown = state.onKeydown;

      console.log("Combobox ready");
      console.log(optionImpls);
      optionImpls.subscribe((options) => {
        console.log(options);
      });
      ready = true;
    })
  );

  onMount(() => {
    inputEl.focus();
  });
</script>

{#if ready}
  <div
    class="absolute top-full left-0 mt-2 p-2 bg-white ring rounded-sm flex flex-col gap-2"
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
{/if}
