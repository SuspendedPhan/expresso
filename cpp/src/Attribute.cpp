//
// Created by Dylan on 4/27/2021.
//

#include "Attribute.h"

#include <utility>

AttributeOutput EditableAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    float value = this->rootNode->eval(evalContext);
    output.value = value;
    output.name = this->name;
    return output;
}

void EditableAttribute::setRootNode(const std::shared_ptr<Node>& rootNode) {
    this->rootNode = rootNode;
    rootNode->setAttribute(shared_from_this());
    rootNode->setReplaceFun([this](const std::shared_ptr<Node>& node) {
        this->setRootNode(node);
        if (this->onChangedSignal.listener) {
            this->onChangedSignal.listener();
        }
    });
}

Node *EditableAttribute::getRootNode() {
    return this->rootNode.get();
}

Signal *EditableAttribute::getOnChangedSignal() {
    return &this->onChangedSignal;
}

IntrinsicAttribute::IntrinsicAttribute(const std::string &name, const weak_ptr<Organism> &organism) : Attribute(name,
        organism) {}

IntrinsicAttribute::IntrinsicAttribute(const std::string &name, const weak_ptr<Organism> &organism, const std::string& id) : Attribute(name,
        organism, id) {}

AttributeOutput IntrinsicAttribute::eval(const EvalContext &evalContext) const {
    AttributeOutput output;
    output.name = this->name;
    const std::weak_ptr<const IntrinsicAttribute> &shared_this = std::static_pointer_cast<const IntrinsicAttribute>(
            shared_from_this());
    output.value = evalContext.valueByIntrinsicAttribute.find(shared_this)->second;
    return output;
}
