//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

#include <utility>

float AttributeReferenceNode::eval(const EvalContext &evalContext) {
    return reference->eval(evalContext).value;
}

float NumberNode::eval(const EvalContext &evalContext) {
    return this->value;
}

float NumberNode::getValue() const {
    return value;
}

std::unique_ptr<NumberNode> NumberNode::make(float value) {
    return std::make_unique<NumberNode>(value);
}

std::unique_ptr<AddOpNode> AddOpNode::make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id) {
    auto op = std::make_unique<AddOpNode>(id);
    BinaryOpNode::set(op.get(), std::move(a), std::move(b));
    return op;
}

std::unique_ptr<SubOpNode> SubOpNode::make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id) {
    auto op = std::make_unique<SubOpNode>(id);
    BinaryOpNode::set(op.get(), std::move(a), std::move(b));
    return op;
}

std::unique_ptr<MulOpNode> MulOpNode::make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id) {
    auto op = std::make_unique<MulOpNode>(id);
    BinaryOpNode::set(op.get(), std::move(a), std::move(b));
    return op;
}

std::unique_ptr<DivOpNode> DivOpNode::make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id) {
    auto op = std::make_unique<DivOpNode>(id);
    BinaryOpNode::set(op.get(), std::move(a), std::move(b));
    return op;
}

std::unique_ptr<ModOpNode> ModOpNode::make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id) {
    auto op = std::make_unique<ModOpNode>(id);
    BinaryOpNode::set(op.get(), std::move(a), std::move(b));
    return op;
}

std::unique_ptr<AttributeReferenceNode> AttributeReferenceNode::make(Attribute* reference) {
    return std::make_unique<AttributeReferenceNode>(reference);
}

void Node::replace(std::unique_ptr<Node> node) {
    this->replaceFun(std::move(node));
}

void Node::setReplaceFun(const std::function<void(std::unique_ptr<Node>)> &replaceFun) {
    this->replaceFun = replaceFun;
}

Signal *Node::getOnChangedSignal() {
    return &this->onChangedSignal;
}

void Node::setAttribute(Attribute* attribute) {
    this->attribute = attribute;
    this->setAttributeForChildren(attribute);
}

Attribute* Node::getAttribute() {
    return this->attribute;
}

Organism* Node::getOrganismRaw() {
    return this->attribute->organism;
}

Node *Node::getParentRaw() {
    return this->parent;
}

void Node::setParent(Node* parent) {
    this->parent = parent;
}

void BinaryOpNode::setAttributeForChildren(Attribute* attribute) {
    this->a->setAttribute(attribute);
    this->b->setAttribute(attribute);
}

void BinaryOpNode::setA(BinaryOpNode * op, std::unique_ptr<Node> a) {
    a->setReplaceFun([&](auto node) {
        setA(op, std::move(node));
    });
    a->setAttribute(op->getAttribute());
    a->setParent(op);
    op->a = std::move(a);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::setB(BinaryOpNode * op, std::unique_ptr<Node> b) {
    b->setReplaceFun([&](auto node) {
        setB(op, std::move(node));
    });
    b->setAttribute(op->getAttribute());
    b->setParent(op);
    op->b = std::move(b);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::set(BinaryOpNode * op, std::unique_ptr<Node> a, std::unique_ptr<Node> b) {
    BinaryOpNode::setA(op, std::move(a));
    BinaryOpNode::setB(op, std::move(b));
}

void FunctionNode::setAttributeForChildren(Attribute* attribute) {
    std::cout << "need to implement this" << std::endl;
}
