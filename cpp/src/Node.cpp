//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

float AttributeReferenceNode::eval(const EvalContext &evalContext) {
    return reference.lock()->eval(evalContext).value;
}

float NumberNode::eval(const EvalContext &evalContext) {
    return this->value;
}

float NumberNode::getValue() const {
    return value;
}

shared_ptr<AddOpNode> AddOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    return std::make_shared<AddOpNode>(a, b);
}

shared_ptr<SubOpNode> SubOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    return std::make_shared<SubOpNode>(a, b);
}

shared_ptr<MulOpNode> MulOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    return std::make_shared<MulOpNode>(a, b);
}

shared_ptr<DivOpNode> DivOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    return std::make_shared<DivOpNode>(a, b);
}

shared_ptr<ModOpNode> ModOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    return std::make_shared<ModOpNode>(a, b);
}

shared_ptr<NumberNode> NumberNode::make(float value) {
    return std::make_shared<NumberNode>(value);
}

void Node::replace(shared_ptr<Node> node) {
    this->replaceFun(std::move(node));
}

void Node::setReplaceFun(const std::function<void(shared_ptr<Node>)> &replaceFun) {
    this->replaceFun = replaceFun;
}

Signal *Node::getOnChangedSignal() {
    return &this->onChangedSignal;
}

void Node::setAttribute(const std::weak_ptr<Attribute>& attribute) {
    this->attribute = attribute;
}

weak_ptr<Attribute> Node::getAttribute() {
    return this->attribute;
}

Organism* Node::getOrganismRaw() {
    return this->attribute.lock()->organism.lock().get();
}

