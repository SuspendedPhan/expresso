//
// Created by Dylan on 6/4/2021.
//

#include "FunctionParameter.h"
#include "Code.h"

#include <utility>

FunctionParameter::FunctionParameter(std::string id, std::string name) : id(std::move(id)), name(std::move(name)) {}

FunctionParameter::FunctionParameter(std::string name) : name(std::move(name)), id(Code::generateUuidV4()) {}
