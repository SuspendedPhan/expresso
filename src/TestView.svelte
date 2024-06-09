<script lang="ts">
  import GoModuleLoader from "./GoModuleLoader";
  import MainContext from "./MainContext";

  GoModuleLoader.get$().subscribe((v) => {
    console.log("GoModuleLoader.get$", v);
    const ctx = new MainContext(v);
    const id = ctx.getRootAttributeExprId();
    console.log("id", id);
  });
</script>

<main>
  <div>Hello World</div>
</main>

<style></style>
