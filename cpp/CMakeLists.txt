cmake_minimum_required(VERSION 3.19)
project(expresso)

set(CMAKE_CXX_STANDARD 14)

#if (MSVC_VERSION GREATER_EQUAL "1900")
#    include(CheckCXXCompilerFlag)
#
#    CHECK_CXX_COMPILER_FLAG("/std:c++latest" _cpp_latest_flag_supported)
#    if (_cpp_latest_flag_supported)
#        add_compile_options("/Zc:__cplusplus")
#        add_compile_options("/std:c++latest")
#    endif()
#endif()


add_executable(expresso src/main.cpp src/Attribute.cpp src/Node.cpp src/Code.h src/Signal.cpp src/Signal.h src/Project.cpp src/Project.h src/Function.cpp src/Function.h src/FunctionParameter.cpp src/FunctionParameter.h src/Car.h src/Driver.h src/variant.h src/NodeParent.cpp src/NodeParent.h)
add_library(WasmModule src/WasmModule.cpp src/Organism.h src/Node.h src/EvalOutput.h src/EvalContext.h src/Node.cpp src/Attribute.cpp src/WasmModule.h src/FakeBook.h src/EmbindUtil.h src/Signal.cpp src/Signal.h src/Project.cpp src/Project.h src/Function.cpp src/Function.h src/FunctionParameter.cpp src/FunctionParameter.h src/Car.h src/Driver.h)
add_executable(testest src/main.cpp src/Driver.h)
include_directories("C:\\Users\\Dylan\\Documents\\GitHub\\emsdk\\upstream\\emscripten\\system\\include")