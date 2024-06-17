<script lang="ts">
  import Persistence from "../persistence/Persistence";

  Persistence.writeDebugOverlay({
    name: "TestView",
  }).then(() => {
    console.log("TestView written to debug overlay");
    Persistence.readLoggerConfig();
  });
</script>

<main>
  <div>Hello World</div>
</main>

<style></style>
