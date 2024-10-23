<script lang="ts">
  import { type FocusViewProps } from "./FocusView";

  export let props: FocusViewProps;

  let clazz: string = "";
  export { clazz as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown|stopPropagation={props.onMouseDown} class="{clazz} ring-black" class:ring-2={props.focused}>
  <slot />
</div>
