#ifndef EXPRESSO_NODE_H
#define EXPRESSO_NODE_H

#include "Attribute.h"

template <typename T>
using vector = std::vector<T>;
template <typename T, typename V>
using map = std::map<T, V>;
template <typename T>
using weak_ptr = std::weak_ptr<T>;
template <typename T>
using shared_ptr = std::shared_ptr<T>;
template <typename T>
using unique_ptr = std::unique_ptr<T>;

class ParameterNode;
class Attribute;

class Node {
    public:
        virtual float eval(const EvalContext& evalContext) = 0;
        virtual ~Node() = default;
};

class NumberNode : public Node {
public:
    float value;

    NumberNode(float value) { this->value = value; }

    float eval(const EvalContext& evalContext) override {
        printf("number eval\n");
        return this->value;
    }
};

class BinaryOpNode: public Node {
public:
    shared_ptr<Node> a;
    shared_ptr<Node> b;

    BinaryOpNode(shared_ptr<Node> a, shared_ptr<Node> b) {
        this->a = a;
        this->b = b;
    }
};


class AddOpNode: public BinaryOpNode {
public:
    AddOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }
};

class SubOpNode: public BinaryOpNode {
public:
    SubOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) - this->b->eval(evalContext);
    }
};

class DivOpNode: public BinaryOpNode {
public:
    DivOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) / this->b->eval(evalContext);
    }
};

class FunctionNode: public Node {
    public:
        vector<shared_ptr<Node>> arguments;
        shared_ptr<Node> rootNode;

        float eval(const EvalContext& evalContext) override {
            printf("function eval\n");
            return this->rootNode->eval(evalContext);
        }

        static shared_ptr<FunctionNode> makeAverage() {
            shared_ptr<FunctionNode> node = std::make_shared<FunctionNode>();
            auto aNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 0);
            auto bNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 1);
            auto addNode = std::make_shared<AddOpNode>(aNode, bNode);
            auto twoNode = std::make_shared<NumberNode>(2.0f);
            auto divNode = std::make_shared<DivOpNode>(addNode, twoNode);
            node->rootNode = divNode;
            return node;
        }
};

class ParameterNode: public Node {
    public:
        weak_ptr<FunctionNode> fun;
        int parameterIndex;

        ParameterNode(weak_ptr<FunctionNode> fun,
        int parameterIndex) {
            this->fun = fun;
            this->parameterIndex = parameterIndex;
        }

        float eval(const EvalContext& evalContext) override {
            return this->fun.lock()->arguments[this->parameterIndex]->eval(evalContext);
        }
};


class AttributeReferenceNode : public Node {
    public:
        weak_ptr<Attribute> attribute;
        AttributeReferenceNode(weak_ptr<Attribute> attribute) { this->attribute = attribute; }

        float eval(const EvalContext& evalContext);
};


#endif //EXPRESSO_NODE_H
