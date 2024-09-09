<script lang="ts">
  import FocusView from "src/utils/views/FocusView.svelte";

  export let ctx: MainContext | null = null;
  export let focused = false;
</script>

<FocusView {focused}>
  <button on:click class="btn"><slot></slot></button>
</FocusView>
