//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

float AttributeReferenceNode::eval(const EvalContext &evalContext) {
    return attribute.lock()->eval(evalContext).value;
}

float NumberNode::eval(const EvalContext &evalContext) {
    return this->value;
}

void Node::replace(shared_ptr<Node> node) {
    this->replaceFun(std::move(node));
}

void Node::setReplaceFun(const std::function<void(shared_ptr<Node>)> &replaceFun) {
    this->replaceFun = replaceFun;
}