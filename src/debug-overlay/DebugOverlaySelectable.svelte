<script lang="ts">
  import { Observable, map } from "rxjs";

  export let selected$: Observable<boolean>;

  const borderClass$ = selected$.pipe(
    map((selected) => {
      if (selected) {
        return "border-solid";
      } else {
        return "border-transparent";
      }
    })
  );
</script>

<div class="border {$borderClass$}">
  <slot />
</div>
