<script lang="ts">
  import { BehaviorSubject } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import TreeListContainer from "src/utils/layout/TreeListContainer.svelte";
  import { Constants } from "src/utils/utils/ViewUtils";

  export let ctx: MainContext;
  const exObjectLayouts$ = new BehaviorSubject<readonly ElementLayout[]>([]);
</script>

<TreeListContainer
  class="flex flex-col items-center"
  containerPadding={Constants.WindowPadding}
  layouts$={exObjectLayouts$}
></TreeListContainer>
