<script lang="ts">
  import { combineLatest } from "rxjs";
  import LoggerConfig from "../utils/LoggerConfig";

  const topics$ = LoggerConfig.get().getMutedTopics$();
  const methods$ = LoggerConfig.get().getMutedMethods$();
  const keys$ = LoggerConfig.get().getMutedKeys$();

  // Convert to observable of array
  let selectables = [];
  combineLatest([topics$, methods$, keys$]).subscribe(
    ([topics, methods, keys]) => {
      const ss = [];
      for (const topic of topics) {
        ss.push(topic);
      }

      for (const method of methods) {
        ss.push(method);
      }

      for (const key of keys) {
        ss.push(key);
      }

      selectables = ss;
    }
  );
</script>

<div>
  <div>Topics</div>
  {#each $topics$ as topic}
    <div>{topic}</div>
  {/each}

  <div>Methods</div>
  {#each $methods$ as method}
    <div>{method.topic} - {method.method}</div>
  {/each}

  <div>Keys</div>
  {#each $keys$ as key}
    <div>{key.topic} - {key.method} - {key.key}</div>
  {/each}
</div>
