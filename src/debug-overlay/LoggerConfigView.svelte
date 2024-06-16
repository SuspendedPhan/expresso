<script lang="ts">
  import LoggerConfig from "../utils/LoggerConfig";

  const topics$ = LoggerConfig.get().getMutedTopics$();
  const methods$ = LoggerConfig.get().getMutedMethods$();
  const keys$ = LoggerConfig.get().getMutedKeys$();
</script>

<div>
  <div>Topics</div>
  {#each $topics$ as topic}
    <div>{topic}</div>
  {/each}

  <div>Methods</div>
  {#each $methods$ as method}
    <div>{method.topic}</div>
    <div>{method.method}</div>
  {/each}

  <div>Keys</div>
  {#each $keys$ as key}
    <div>{key.topic}</div>
    <div>{key.method}</div>
    <div>{key.key}</div>
  {/each}
</div>
