<script lang="ts">
  // import type { ExObject } from "src/ex-object/ExObject";
  import Combobox from "src/utils/views/Combobox.svelte";

  interface ComponentOption {
    label: string;
    component: string;
  }

  // export let exObject: ExObject;

  let query: string;
  let options: ComponentOption[] = [
    { label: "Option 1", component: "Option1" },
    { label: "Option 2", component: "Option2" },
    { label: "Option 3", component: "Option3" },
  ];

  function queryChanged(value: string) {
    console.log(`Query changed: ${value}`);
    query = value;
  }

  function optionSelected(option: ComponentOption) {
    console.log(`Selected: ${option.label}`);
  }
</script>

<Combobox
  {query}
  {options}
  onQueryChanged={queryChanged}
  onOptionSelected={optionSelected}
/>
