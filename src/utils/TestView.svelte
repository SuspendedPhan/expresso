<script lang="ts">
  import GoogleCloudPersistService from "../persistence/GCloudPersistence";
  // import Persistence from "../persistence/Persistence";

  const s = new GoogleCloudPersistService();
  s.writeFile("test.txt", "Hello World!").then(() => {
    console.log("File written");
  });

  s.readFile("test.txt").then((data) => {
    console.log("Read file: ", data);
  });
</script>

<main>
  <div>Hello World</div>
</main>

<style></style>
