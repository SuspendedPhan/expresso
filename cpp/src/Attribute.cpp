//
// Created by Dylan on 4/27/2021.
//

#include "Attribute.h"

#include <utility>

AttributeOutput EditableAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    NodeEvalContext nodeEvalContext;
    float value = this->attributeNode->getRootNode()->eval(evalContext, nodeEvalContext);
    output.value = value;
    output.name = this->name;
    return output;
}

void EditableAttribute::setRootNode(std::unique_ptr<Node> rootNode) {
    this->attributeNode->setRootNode(std::move(rootNode));
    if (this->onChangedSignal.listener) {
        this->onChangedSignal.listener();
    }
}

Node *EditableAttribute::getRootNode() {
    return this->attributeNode->getRootNode().get();
}

Signal *EditableAttribute::getOnChangedSignal() {
    return &this->onChangedSignal;
}

AttributeOutput IntrinsicAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    output.name = this->name;
    output.value = evalContext.valueByIntrinsicAttribute.find(this)->second;
    return output;
}
