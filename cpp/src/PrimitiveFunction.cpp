//
// Created by Dylan on 7/11/2021.
//

#include "PrimitiveFunction.h"

#include <utility>

FunctionParameterCollection makeParameters(std::vector<std::unique_ptr<FunctionParameter>> parameters) {
    FunctionParameterCollection result;
    for (auto &parameter : parameters) {
        result.add(std::move(parameter));
    }
    return result;
}

PrimitiveFunction::PrimitiveFunction(std::string id, std::string name,
        std::vector<std::unique_ptr<FunctionParameter>> parameters,
        std::function<Value(std::map<const FunctionParameter *, Value>)> eval) : id(std::move(id)), name(std::move(name)),
        _parameters(makeParameters(std::move(parameters))), eval(std::move(eval)) {}

const std::string &PrimitiveFunction::getId() const {
    return id;
}

const std::string &PrimitiveFunction::getName() const {
    return name;
}

const FunctionParameterCollection * PrimitiveFunction::getParameters() const {
    return &_parameters;
}
