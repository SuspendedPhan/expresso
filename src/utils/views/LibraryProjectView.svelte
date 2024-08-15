<script lang="ts">
  import { of } from "rxjs";
  import type { LibraryProject } from "src/library/LibraryProject";
  import MainContext from "src/main-context/MainContext";

  export let ctx: MainContext;
  export let project: LibraryProject;
  const selected$ = of(false);
</script>

<tr class:ring={$selected$}>
  <td>{project.id}</td>
  <td>{project.name}</td>
</tr>
