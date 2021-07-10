//
// Created by Dylan on 6/4/2021.
//

#include "Function.h"

#include <utility>


void Function::addParameter(std::unique_ptr<FunctionParameter> parameter) {
    this->parameters.push_back(std::move(parameter));
    this->_onChangedSignal.dispatch();
}

Function::Function(std::string name, std::string id)
        : id(std::move(id)), name(std::move(name)) {
}
Function::Function(std::string name)
        : id(Code::generateUuidV4()), name(std::move(name)) {
}

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

const std::string &Function::getId() const {
    return id;
}

Node * Function::getRootNode() {
    if (!_rootNode) {
        std::cerr << "Function::getRootNode null" << std::endl;
    }
    return _rootNode.get();
}

void Function::setRootNode(std::unique_ptr<Node> rootNode) {
    rootNode->setParent(std::make_unique<NodeParent>(this));
    _rootNode = std::move(rootNode);
    _onChangedSignal.dispatch();
}

Project *Function::getProject() {
    return _project;
}

void Function::setProject(Project *project) {
    _project = project;
}

Signal * Function::getOnChangedSignal() {
    return &_onChangedSignal;
}
