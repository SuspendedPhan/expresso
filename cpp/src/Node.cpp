//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"

#include <utility>

float AttributeReferenceNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return reference->eval(evalContext).value;
}

float NumberNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return this->value;
}

float NumberNode::getValue() const {
    return value;
}

std::unique_ptr<AttributeReferenceNode> AttributeReferenceNode::make(Attribute* reference) {
    return std::make_unique<AttributeReferenceNode>(reference);
}

void Node::replace(std::unique_ptr<Node> node) {
    if (this->parent == nullptr) {
        if (auto * editableAttribute = dynamic_cast<EditableAttribute *>(this->getAttribute())) {
            editableAttribute->setRootNode(std::move(node));
        } else {
            std::cerr << "replace; editable attribute" << std::endl;
        }
    } else if (auto * binaryOpNode = dynamic_cast<BinaryOpNode *>(this->parent)) {
        if (binaryOpNode->getA() == this) {
            BinaryOpNode::setA(binaryOpNode, std::move(node));
        } else if (binaryOpNode->getB() == this) {
            BinaryOpNode::setB(binaryOpNode, std::move(node));
        } else {
            std::cerr << "replace; binaryopnode" << std::endl;
        }
    } else {
        std::cerr << "replace; dunno" << std::endl;
    }
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
    a->setAttribute(op->getAttribute());
    a->setParent(op);
    op->a = std::move(a);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::setB(BinaryOpNode * op, std::unique_ptr<Node> b) {
    b->setAttribute(op->getAttribute());
    b->setParent(op);
    op->b = std::move(b);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::set(BinaryOpNode * op, std::unique_ptr<Node> a, std::unique_ptr<Node> b) {
    BinaryOpNode::setA(op, std::move(a));
    BinaryOpNode::setB(op, std::move(b));
}

float FunctionCallNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    for (const auto & entries : this->argumentByParameter) {
        const auto & parameter = entries.first;
        const auto & argumentRootNode = entries.second;
        const auto argumentValue = argumentRootNode->eval(evalContext, nodeEvalContext);
        nodeEvalContext.valueByParameter[parameter] = argumentValue;
    }
    const auto answer = this->function->rootNode->eval(evalContext, nodeEvalContext);
    for (const auto & entries : this->argumentByParameter) {
        // Recursive functions are not implemented yet.
        nodeEvalContext.valueByParameter.erase(entries.first);
    }
    return answer;
}

FunctionCallNode::FunctionCallNode(Function *function,
        map<const FunctionParameter *, std::unique_ptr<Node>> argumentByParameter) : function(function), argumentByParameter(
        std::move(argumentByParameter)) {
}

FunctionCallNode::FunctionCallNode(Function *function,
        map<const FunctionParameter *, unique_ptr<Node>> argumentByParameter, std::string id) : function(function), argumentByParameter(
        std::move(argumentByParameter)), Node(
        std::move(id)) {
}

float ParameterNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return nodeEvalContext.valueByParameter.at(this->functionParameter);
}
