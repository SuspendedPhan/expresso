//
// Created by Dylan on 6/4/2021.
//

#include "Function.h"

#include <utility>


void Function::addParameter(std::unique_ptr<FunctionParameter> parameter) {
    this->parameters.push_back(std::move(parameter));
}

Function::Function(std::string name, std::unique_ptr<Node> rootNode, std::string id)
        : id(std::move(id)), name(std::move(name)), rootNode(std::move(rootNode)) {}
Function::Function(std::string name, std::unique_ptr<Node> rootNode)
        : id(Code::generateUuidV4()), name(std::move(name)), rootNode(std::move(rootNode)) {}

const std::string &Function::getName() const {
    return name;
}

std::vector<FunctionParameter *> Function::getParameters() {
    std::vector<FunctionParameter *> answer;
    for (const auto & parameter : this->parameters) {
        answer.push_back(parameter.get());
    }
    return answer;
}
