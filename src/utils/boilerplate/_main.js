import "./app.css";
import App from "../../App.svelte";
import assert, { configureAssert } from "assert-ts";

configureAssert({
  errorReporter: (failureType, message, props) => {
    console.error(message);
  },
});

const app = new App({
  target: document.getElementById("app"),
});

export default app;
