#!/bin/bash

set -e

export OPTIMIZE="--profiling -s LLD_REPORT_UNDEFINED -s ASSERTIONS=1"
#export OPTIMIZE="-Os"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

echo "============================================="
echo "Compiling wasm bindings"
echo "============================================="

emcc -v

(
  # Compile C/C++ code
  emcc \
    ${OPTIMIZE} \
    --bind \
    -s STRICT=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ASSERTIONS=0 \
    -s MALLOC=emmalloc \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s USE_ES6_IMPORT_META=0 \
    -o ./WasmModule.js \
    --no-entry \
    -s ENVIRONMENT=web \
    ./cpp/src/WasmModule.cpp \
    ./cpp/src/Attribute.cpp \
    ./cpp/src/Node.cpp \
    ./cpp/src/Signal.cpp \
    ./cpp/src/Project.cpp \
    ./cpp/src/Function.cpp \
    ./cpp/src/FunctionParameter.cpp \
    ./cpp/src/NodeParent.cpp \
    ./cpp/src/EvalContext.cpp \

  # Create output folder
#  mkdir -p dist

  # Move artifacts
  mv WasmModule.{js,wasm} js/public
)
echo "============================================="
echo "Compiling wasm bindings done"
echo "============================================="