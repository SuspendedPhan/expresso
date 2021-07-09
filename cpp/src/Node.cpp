//
// Created by Dylan on 4/27/2021.
//

#include "Node.h"
#include "Organism.h"

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

std::unique_ptr<AttributeReferenceNode> AttributeReferenceNode::make(Attribute *reference) {
    return std::make_unique<AttributeReferenceNode>(reference);
}

void Node::replace(std::unique_ptr<Node> node) {
    if (this->parent->isNode()) {
        const auto parentNode = this->parent->getNode();
        if (auto *binaryOpNode = dynamic_cast<BinaryOpNode *>(parentNode)) {
            if (binaryOpNode->getA() == this) {
                BinaryOpNode::setA(binaryOpNode, std::move(node));
            } else if (binaryOpNode->getB() == this) {
                BinaryOpNode::setB(binaryOpNode, std::move(node));
            } else {
                std::cerr << "replace; binaryopnode" << std::endl;
            }
        } else if (auto *functionCallNode = dynamic_cast<FunctionCallNode *>(parentNode)) {
            auto argumentByParameterMap = functionCallNode->getArgumentByParameterMap();
            for (const auto &entry : argumentByParameterMap) {
                const auto &parameter = entry.first;
                const auto &argument = entry.second;
                if (argument == this) {
                    functionCallNode->setArgument(parameter, std::move(node));
                    break;
                }
            }
        } else {
            std::cerr << "replace; dunno; " << typeid(node.get()).name() << std::endl;
        }
    } else if (this->parent->isAttribute()) {
        if (auto * attribute = dynamic_cast<EditableAttribute *>(this->parent->getAttribute())) {
            attribute->setRootNode(std::move(node));
        } else {
            std::cerr << "node::replace non editable attr" << std::endl;
        }
    } else {
        std::cerr << "not implemented node::replace" << std::endl;
    }
}

Signal *Node::getOnChangedSignal() {
    return &this->onChangedSignal;
}

Attribute *Node::getAttribute() { // NOLINT(misc-no-recursion)
    if (!this->parent) {
        std::cerr << "Node::getAttribute error! dylan" << std::endl;
    }

    if (this->parent->isNode()) {
        return this->parent->getNode()->getAttribute();
    } else if (this->parent->isAttribute()) {
        return this->parent->getAttribute();
    } else if (this->parent->isFunction()) {
        return nullptr;
    } else {
        std::cerr << "Node::getAttribute dylan error" << std::endl;
        return nullptr;
    }
}

Organism *Node::getOrganism() {
    Attribute *attribute = this->getAttribute();
    if (attribute == nullptr) {
        return nullptr;
    }
    return attribute->organism;
}

void Node::setParent(std::unique_ptr<NodeParent> parent) {
    this->parent = std::move(parent);
}

NodeParent * Node::getParent() {
    return this->parent.get();
}

Function *Node::getFunction() { // NOLINT(misc-no-recursion)
    if (!this->parent) {
        std::cerr << "Node::getAttribute error! dylan" << std::endl;
    }

    if (this->parent->isNode()) {
        return this->parent->getNode()->getFunction();
    } else if (this->parent->isAttribute()) {
        return nullptr;
    } else if (this->parent->isFunction()) {
        return this->parent->getFunction();
    } else {
        std::cerr << "Node::getFunction dylan error" << std::endl;
        return nullptr;
    }
}

Project *Node::getProject() {
    if (!this->parent) {
        std::cerr << "Node::getAttribute error! dylan" << std::endl;
    }

    auto organism = this->getOrganism();
    auto fun = this->getFunction();
    if (organism != nullptr) {
        return organism->getProject();
    } else if (fun != nullptr) {
        return fun->getProject();
    } else {
        std::cerr << "Node::getProject dylan error" << std::endl;
        return nullptr;
    }
}

bool Node::equals(Node *node) {
    return this->getId() == node->getId();
}

void BinaryOpNode::setA(BinaryOpNode *op, std::unique_ptr<Node> a) {
    a->setParent(std::make_unique<NodeParent>(op));
    op->a = std::move(a);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::setB(BinaryOpNode *op, std::unique_ptr<Node> b) {
    b->setParent(std::make_unique<NodeParent>(op));
    op->b = std::move(b);
    op->onChangedSignal.dispatch();
}

void BinaryOpNode::set(BinaryOpNode *op, std::unique_ptr<Node> a, std::unique_ptr<Node> b) {
    BinaryOpNode::setA(op, std::move(a));
    BinaryOpNode::setB(op, std::move(b));
}

float FunctionCallNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    for (const auto &entries : this->argumentByParameter) {
        const auto &parameter = entries.first;
        const auto &argumentRootNode = entries.second;
        const auto argumentValue = argumentRootNode->eval(evalContext, nodeEvalContext);
        nodeEvalContext.valueByParameter[parameter] = argumentValue;
    }
    const auto answer = this->function->getRootNode()->eval(evalContext, nodeEvalContext);
    for (const auto &entries : this->argumentByParameter) {
        // Recursive functions are not implemented yet.
        nodeEvalContext.valueByParameter.erase(entries.first);
    }
    return answer;
}

FunctionCallNode::FunctionCallNode(Function *function) : function(function) {}

FunctionCallNode::FunctionCallNode(Function *function, std::string id) : function(function), Node(std::move(id)) {}

void FunctionCallNode::setArgument(const FunctionParameter *parameter, std::unique_ptr<Node> argumentRootNode) {
    argumentRootNode->setParent(std::make_unique<NodeParent>(this));
    this->argumentByParameter[parameter] = std::move(argumentRootNode);
    this->onChangedSignal.dispatch();
}

const std::string &FunctionCallNode::getName() const {
    return this->function->getName();
}

float ParameterNode::eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) {
    return nodeEvalContext.valueByParameter.at(this->functionParameter);
}

FunctionParameter *ParameterNode::getFunctionParameter() const {
    return functionParameter;
}


std::map<const FunctionParameter *, Node *> FunctionCallNode::getArgumentByParameterMap() {
    std::map<const FunctionParameter *, Node *> answer;
    for (const auto &entry : this->argumentByParameter) {
        answer.insert({entry.first, entry.second.get()});
    }
    return answer;
}

Function *FunctionCallNode::getFunction() const {
    return function;
}
