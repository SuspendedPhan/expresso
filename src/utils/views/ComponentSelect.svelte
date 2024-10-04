<script lang="ts">
  import type { ExObject } from "src/ex-object/ExObject";
  import type { ComboboxOption } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";

  export let exObject: ExObject;

  let query: string;
  let options: ComboboxOption[];

  function queryChanged(value: string) {
    query = value;
  }

  function optionSelected(option: ComboboxOption) {}
</script>

<Combobox
  {query}
  {options}
  on:queryChanged={queryChanged}
  on:optionSelected={optionSelected}
/>
