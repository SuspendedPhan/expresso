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


add_executable(expresso main.cpp)
add_library(WasmModule WasmModule.cpp Attribute.cpp EditableAttribute.cpp Organism.h)
include_directories("C:\\Users\\Dylan\\Documents\\GitHub\\emsdk\\upstream\\emscripten\\system\\include")