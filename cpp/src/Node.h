#ifndef EXPRESSO_NODE_H
#define EXPRESSO_NODE_H

#include "Attribute.h"
#include "Code.h"
#include "Signal.h"
#include <iostream>
#include <functional>

template<typename T>
using vector = std::vector<T>;
template<typename T, typename V>
using map = std::map<T, V>;
template<typename T>
using weak_ptr = std::weak_ptr<T>;
template<typename T>
using shared_ptr = std::shared_ptr<T>;
template<typename T>
using unique_ptr = std::unique_ptr<T>;

class ParameterNode;

class Attribute;

class Node {
private:
    std::string id = Code::generateUuidV4();
    std::function<void(shared_ptr<Node>)> replaceFun;
    weak_ptr<Attribute> attribute;
protected:
    Signal onChangedSignal;
public:
    virtual float eval(const EvalContext &evalContext) = 0;
    std::string getId() { return this->id; }
    void replace(shared_ptr<Node> node);
    void setReplaceFun(const std::function<void(shared_ptr<Node>)> &replaceFun);
    void setAttribute(const std::weak_ptr<Attribute>& attribute);

    Signal* getOnChangedSignal();
    weak_ptr<Attribute> getAttribute();
    Organism* getOrganismRaw();

    virtual ~Node() = default;
};

class NumberNode : public Node {
public:
    float value;

    float getValue() const;

    NumberNode(float value) { this->value = value; }

    static shared_ptr<NumberNode> make(float value);

    float eval(const EvalContext &evalContext) override;
};


class BinaryOpNode : public Node {
public:
    shared_ptr<Node> a;
    shared_ptr<Node> b;

    BinaryOpNode(shared_ptr<Node> a, shared_ptr<Node> b) {
        this->replaceA(a);
        this->replaceB(b);
    }

    Node* getA() {
        return a.get();
    }

    Node* getB() {
        return b.get();
    }

    void replaceA(shared_ptr<Node> a) {
        a->setReplaceFun(std::bind(&BinaryOpNode::replaceA, this, std::placeholders::_1));
        a->setAttribute(this->getAttribute());
        this->a = a;
        this->onChangedSignal.dispatch();
    }

    void replaceB(shared_ptr<Node> b) {
        b->setReplaceFun(std::bind(&BinaryOpNode::replaceB, this, std::placeholders::_1));
        b->setAttribute(this->getAttribute());
        this->b = b;
        this->onChangedSignal.dispatch();
    }
};


class AddOpNode : public BinaryOpNode {
public:
    AddOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    static shared_ptr<AddOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }
};

class SubOpNode : public BinaryOpNode {
public:
    SubOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    static shared_ptr<SubOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) - this->b->eval(evalContext);
    }
};

class MulOpNode : public BinaryOpNode {
public:
    MulOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    static shared_ptr<MulOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) * this->b->eval(evalContext);
    }
};

class DivOpNode : public BinaryOpNode {
public:
    DivOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    static shared_ptr<DivOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) / this->b->eval(evalContext);
    }
};

class ModOpNode : public BinaryOpNode {
public:
    ModOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    static shared_ptr<ModOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    float eval(const EvalContext &evalContext) override {
        float aEval = this->a->eval(evalContext);
        float bEval = this->b->eval(evalContext);
        float answer = fmod(aEval, bEval);
        return answer;
    }
};

class FunctionNode : public Node {
public:
    vector<shared_ptr<Node>> arguments;
    shared_ptr<Node> rootNode;

    float eval(const EvalContext &evalContext) override {
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

class ParameterNode : public Node {
public:
    weak_ptr<FunctionNode> fun;
    int parameterIndex;

    ParameterNode(weak_ptr<FunctionNode> fun,
            int parameterIndex) {
        this->fun = fun;
        this->parameterIndex = parameterIndex;
    }

    float eval(const EvalContext &evalContext) override {
        return this->fun.lock()->arguments[this->parameterIndex]->eval(evalContext);
    }
};


class AttributeReferenceNode : public Node {
public:
    weak_ptr<Attribute> reference;

    Attribute* getReferenceRaw() {
        return reference.lock().get();
    }

    AttributeReferenceNode(weak_ptr<Attribute> reference) { this->reference = reference; }

    float eval(const EvalContext &evalContext);
};


#endif //EXPRESSO_NODE_H
