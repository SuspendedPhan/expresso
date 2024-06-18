<script lang="ts">
  import GoogleCloudPersistService from "../persistence/GCloudPersistence";
  // import Persistence from "../persistence/Persistence";

  const s = new GoogleCloudPersistService();
  s.writeFile("test.txt", "Hello World!").then(() => {
    console.log("File written");
  });
</script>

<main>
  <div>Hello World</div>
</main>

<style></style>
