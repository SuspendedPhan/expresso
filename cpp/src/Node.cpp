//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

#include <utility>

float AttributeReferenceNode::eval(const EvalContext &evalContext) {
    return reference.lock()->eval(evalContext).value;
}

float NumberNode::eval(const EvalContext &evalContext) {
    return this->value;
}

float NumberNode::getValue() const {
    return value;
}

shared_ptr<NumberNode> NumberNode::make(float value) {
    return std::make_shared<NumberNode>(value);
}

shared_ptr<AddOpNode> AddOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    const auto &op = std::make_shared<AddOpNode>();
    BinaryOpNode::set(op, a, b);
    return op;
}

shared_ptr<SubOpNode> SubOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    const auto &op = std::make_shared<SubOpNode>();
    BinaryOpNode::set(op, a, b);
    return op;
}

shared_ptr<MulOpNode> MulOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    const auto &op = std::make_shared<MulOpNode>();
    BinaryOpNode::set(op, a, b);
    return op;
}

shared_ptr<DivOpNode> DivOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    const auto &op = std::make_shared<DivOpNode>();
    BinaryOpNode::set(op, a, b);
    return op;
}

shared_ptr<ModOpNode> ModOpNode::make(const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    const auto &op = std::make_shared<ModOpNode>();
    BinaryOpNode::set(op, a, b);
    return op;
}

shared_ptr<AttributeReferenceNode> AttributeReferenceNode::make(Attribute* reference) {
    return std::make_shared<AttributeReferenceNode>(reference->shared_from_this());
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
    this->setAttributeForChildren(attribute);
}

weak_ptr<Attribute> Node::getAttribute() {
    return this->attribute;
}

Organism* Node::getOrganismRaw() {
    const shared_ptr<Attribute> &attribute = this->attribute.lock();
    return attribute->organism.lock().get();
}

Node *Node::getParentRaw() {
    if (this->parent.expired()) {
        return nullptr;
    } else {
        return this->parent.lock().get();
    }
}

void Node::setParent(const weak_ptr<Node> &parent) {
    this->parent = parent;
}

void BinaryOpNode::setAttributeForChildren(weak_ptr<Attribute> attribute) {
    this->a->setAttribute(attribute);
    this->b->setAttribute(attribute);
}

void BinaryOpNode::setA(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& a) {
    a->setReplaceFun([op](auto node) {
        setA(op, node);
    });
    a->setAttribute(op->getAttribute());
    a->setParent(op);
    op->a = a;
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::setB(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& b) {
    b->setReplaceFun([op](auto node) {
        setB(op, node);
    });
    b->setAttribute(op->getAttribute());
    b->setParent(op);
    op->b = b;
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::set(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& a, const shared_ptr<Node>& b) {
    BinaryOpNode::setA(op, a);
    BinaryOpNode::setB(op, b);
}

void FunctionNode::setAttributeForChildren(weak_ptr<Attribute> attribute) {
    std::cout << "need to implement this" << std::endl;
}
