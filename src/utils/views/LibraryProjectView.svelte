<script lang="ts">
  import { of } from "rxjs";
  import type { LibraryProject } from "src/ex-object/LibraryProject";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";

  export let project: LibraryProject;
  const selected$ = of(false);
</script>

<tr class:ring={$selected$}>
  <td>{project.id}</td>
  <td>{project.name}</td>
  <td><ExObjectButton>Open</ExObjectButton></td>
</tr>
