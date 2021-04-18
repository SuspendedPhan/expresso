#include <emscripten/bind.h>

using namespace emscripten;

int say_hello() {
  printf("Hello from your wasm module");
  return 0;
}

EMSCRIPTEN_BINDINGS(WasmModule) {
  function("sayHello", &say_hello);
}