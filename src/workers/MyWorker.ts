import loader from "@assemblyscript/loader"; // or require
import { SimpleEventDispatcher } from "strongly-typed-events";
import { Observable } from "rxjs";

const ctx: Worker = self as any;

const onExportsReady = new SimpleEventDispatcher<any>();
let exports = null;
const exportsObservable = new Observable(sub => {
  if (exports) {
    sub.next(exports);
  } else {
    onExportsReady.sub(exp => {
      exports = exp;
      sub.next(exports);
    });
  }
});
console.log("sdf");

ctx.addEventListener("message", async event => {
  console.log("worker receive " + JSON.stringify(event.data));
  if (event.data.memory) {
    console.log("worker receive memory");
    init(event.data.memory);
    return;
  }

  if (event.data.getClones) {
    console.log("worker getClones");
    exportsObservable.subscribe((exports: any) => {
      console.log("worker getClones");
      ctx.postMessage({ clones: exports.Ast.getClones() });
    });
    return;
  }

  console.log("worker receive work");

  exportsObservable.subscribe((exports: any) => {
    console.log("worker doing work");
    const { startIndex, postEndIndex } = event.data;
    const { Ast, EvalOutput } = exports;
    // Ast.eval(startIndex, postEndIndex);
    ctx.postMessage("done");
  });
});

async function init(memory) {
  const wasm = fetch("/build/optimized.wasm");
  const exports = (await loader.instantiate(wasm, { env: { memory } })).exports;
  onExportsReady.dispatch(exports);
  console.log("worker init done");
}