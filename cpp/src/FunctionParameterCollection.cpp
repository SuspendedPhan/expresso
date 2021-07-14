//
// Created by Dylan on 7/13/2021.
//

#include "FunctionParameterCollection.h"

std::vector<const FunctionParameter *> FunctionParameterCollection::getAll() {
    std::vector<const FunctionParameter *> result;
    for (const auto& t : _parameters) {
        result.push_back(t.get());
    }
    return result;
}

void FunctionParameterCollection::add(std::unique_ptr<FunctionParameter> parameter) {
    _parameters.push_back(std::move(parameter));
}
