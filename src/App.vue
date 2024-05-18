<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Grandstander:200,300,400,500"
    />
  </div>
</template>

<style>
body,
input,
button,
select {
  font-size: 14pt;
  font-family: 'Grandstander';
  font-weight: 200;
  line-height: 150%;
}
body {
  margin: 0;
}

button {
  background-color: white;
  border: 1px solid black;
  border-radius: 3px;
}
button:hover {
  background-color: gray;
  color: white;
}
.ql-clipboard {
  display: none;
}
.ql-editor {
  overflow-y: auto;
  word-wrap: anywhere;
}
p {
  margin: 0;
}
.ql-color-variable {
  color: rgba(113, 0, 225, 0.55);
}
.ql-color-function {
  color: #3bb5dc;
}
.ql-bg-selected {
  background-color: #a8d1ff;
}

.ql-editor {
  color: rgba(0, 0, 0, 0.6);
  padding: 5px;
  margin-left: -5px;
  margin-bottom: 5px;
}

p::selection,
span::selection {
  /* background-color: #a8d1ff; */
  background-color: rgba(0, 0, 0, 0);
}

.ql-editor:focus {
  outline-color: rgba(168, 209, 255, 0.4);
  /* border:1px solid rgba(0, 0, 0, 0.2); */
  /* box-sizing:content-box; */
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); */
}
*,
*:before,
*:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
</style>
