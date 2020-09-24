<template>
  <div id="app">
    <router-view/>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Grandstander:200,300,400">
  </div>
</template>

<style>
body, input, button {
  font-size: 16pt;
  font-family: 'Grandstander';
  font-weight: 200;
  line-height: 150%;
}
body {
  margin: 0;
}

button {
  background-color: transparent;
  border: 1px solid black;
}
button:hover {
  background-color: gray;
  color: white;
}
</style>
