<script lang="ts">
  import { BehaviorSubject, map } from "rxjs";

  const x$ = new BehaviorSubject(0);
  const y$ = x$.pipe(map((v) => v + 1));
</script>

<main>
  <div>Hello World</div>
  <div>{$x$}</div>
  <div>{$y$}</div>
</main>

<style></style>
