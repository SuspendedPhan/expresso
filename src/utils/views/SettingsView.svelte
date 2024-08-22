<script lang="ts">
  import MainPane from "src/utils/views/MainPane.svelte";

  async function chooseDir() {
    const dirHandle = await self.showDirectoryPicker();
    for await (const entry of dirHandle.values()) {
      console.log(entry.kind, entry.name);
    }
  }
</script>

<MainPane>
  <button class="btn" on:click={chooseDir}>Choose Directory</button>
</MainPane>
