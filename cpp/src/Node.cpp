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

Attribute* Node::getAttribute() {
    return this->parent->getAttribute();
}

Organism* Node::getOrganismRaw() {
    return this->getAttribute()->organism;
}

Node *Node::getParentRaw() {
    return this->parent;
}

void Node::setParent(Node* parent) {
    this->parent = parent;
}

void BinaryOpNode::setA(BinaryOpNode * op, std::unique_ptr<Node> a) {
    a->setParent(op);
    op->a = std::move(a);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::setB(BinaryOpNode * op, std::unique_ptr<Node> b) {
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

FunctionCallNode::FunctionCallNode(Function *function) : function(function) {}

FunctionCallNode::FunctionCallNode(Function *function, std::string id) : function(function), Node(std::move(id)) {}

void FunctionCallNode::setArgument(const FunctionParameter *parameter, std::unique_ptr<Node> argumentRootNode) {
    argumentRootNode->setParent(this);
    this->argumentByParameter[parameter] = std::move(argumentRootNode);
}

const std::string &FunctionCallNode::getName() const {
    return this->function->getName();
}

float ParameterNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return nodeEvalContext.valueByParameter.at(this->functionParameter);
}

Attribute *AttributeNode::getAttribute() {
    return this->attribute;
}

AttributeNode::AttributeNode(Attribute *attribute, unique_ptr<Node> rootNode) : attribute(attribute),
        rootNode(std::move(rootNode)) {
    rootNode->setParent(this);
}

AttributeNode::AttributeNode(Attribute *attribute, unique_ptr<Node> rootNode, std::string id) : attribute(attribute),
        rootNode(std::move(rootNode)), Node(std::move(id)) {
    rootNode->setParent(this);
}

float AttributeNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return this->rootNode->eval(evalContext, nodeEvalContext);
}

const unique_ptr<Node> &AttributeNode::getRootNode() const {
    return this->rootNode;
}

void AttributeNode::setRootNode(unique_ptr<Node> rootNode) {
    rootNode->setParent(this);
    this->rootNode = std::move(rootNode);
}

std::map<const FunctionParameter *, Node *> FunctionCallNode::getArgumentByParameterMap() {
    std::map<const FunctionParameter *, Node *> answer;
    for (const auto & entry : this->argumentByParameter) {
        answer.insert({entry.first, entry.second.get()});
    }
    return answer;
}

Function *FunctionCallNode::getFunction() const {
    return function;
}
