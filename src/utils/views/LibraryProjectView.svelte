<script lang="ts">
  import { map } from "rxjs";
  import type { LibraryProject } from "src/library/LibraryProject";
  import MainContext from "src/main-context/MainContext";

  export let ctx: MainContext;
  export let project: LibraryProject;
  const selected$ = ctx.focusManager
    .getFocus$()
    .pipe(
      map(
        (focus) => focus.type === "LibraryProject" && focus.project === project
      )
    );
</script>

<tr class:ring={$selected$}>
  <td>{project.id}</td>
  <td>{project.name}</td>
</tr>
