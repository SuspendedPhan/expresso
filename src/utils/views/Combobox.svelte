<script lang="ts" generics="T extends { label: string }">
  import assert from "assert-ts";
  import { Option } from "effect";
  import Divider from "src/utils/views/Divider.svelte";

  export let query: string;
  export let options: T[];
  export let onQueryChanged: (value: string) => void = () => {};
  export let onOptionSelected: (option: T) => void = () => {};
  export let onOptionFocused: (option: T) => void = () => {};

  let focusedIndex = Option.none<number>();

  function handleInput(event: any) {
    query = event.target.value;
    onQueryChanged(query);
  }

  function handleKeydown(event: any) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      const vv = Option.map(focusedIndex, (i) => i + 1);
      const vv2 = Option.orElse(vv, () => Option.some(0));
      focusedIndex = vv2;
      assert(Option.isSome(focusedIndex));
      const option = options[focusedIndex.value];
      assert(option !== undefined);
      onOptionFocused(option);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      const vv = Option.map(focusedIndex, (i) => i - 1);
      const vv2 = Option.orElse(vv, () => Option.some(options.length - 1));
      focusedIndex = vv2;
      assert(Option.isSome(focusedIndex));
      const option = options[focusedIndex.value];
      assert(option !== undefined);
      onOptionFocused(option);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (Option.isSome(focusedIndex)) {
        const option = options[focusedIndex.value];
        assert(option !== undefined);
        onOptionSelected(option);
      }
    }
  }

  let input;

  function isIndexFocused(idx: number) {
    const extracted = Option.filter(focusedIndex, (i) => i === idx);
    return Option.isSome(extracted);
  }
</script>

<div
  class="absolute top-full left-0 mt-2 p-2 bg-white ring rounded-sm flex flex-col gap-2"
>
  <div>
    <input
      class="outline-none"
      type="text"
      value={query}
      on:input={handleInput}
      bind:this={input}
      on:keydown={handleKeydown}
    />
  </div>
  <Divider />
  <div>
    {#each options as option, idx}
      <div class:bg-neutral-content={isIndexFocused(idx)}>
        <button on:click={() => onOptionSelected(option)}>{option.label}</button
        >
      </div>
    {/each}
  </div>
</div>
