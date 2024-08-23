<script lang="ts">
  import { get, set } from "idb-keyval";
  import { log5 } from "src/utils/utils/Log3";
  import MainPane from "src/utils/views/MainPane.svelte";

  const log55 = log5("SettingsView.svelte");

  async function setup() {
    const dirHandle = await get("dirHandle");
    if (dirHandle !== undefined) {
      log55.debug2("dirHandle", dirHandle);

      for await (const entry of dirHandle.values()) {
        log55.debug(entry.kind, entry.name);
      }
    }
  }

  setup();

  async function chooseDir() {
    const dirHandle = await self.showDirectoryPicker();
    for await (const entry of dirHandle.values()) {
      log55.debug(entry.kind, entry.name);
    }
    set("dirHandle", dirHandle);
  }
</script>

<MainPane>
  <button class="btn" on:click={chooseDir}>Choose Directory</button>
</MainPane>
