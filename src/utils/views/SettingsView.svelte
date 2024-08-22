<script lang="ts">
  async function chooseDir() {
    const dirHandle = await self.showDirectoryPicker();
    for await (const entry of dirHandle.values()) {
      console.log(entry.kind, entry.name);
    }
  }
</script>

<button class="btn" on:click={chooseDir}>Choose Directory</button>
