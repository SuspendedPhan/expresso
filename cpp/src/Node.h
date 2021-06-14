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
    std::string id;
    std::function<void(shared_ptr<Node>)> replaceFun;
    weak_ptr<Attribute> attribute;
    weak_ptr<Node> parent;
protected:
    Signal onChangedSignal;
    virtual void setAttributeForChildren(weak_ptr<Attribute> attribute) = 0;
public:
    Node() : id(Code::generateUuidV4()) {}
    explicit Node(std::string id) : id(std::move(id)) {}

    virtual float eval(const EvalContext &evalContext) = 0;
    std::string getId() { return this->id; }
    void replace(shared_ptr<Node> node);
    void setReplaceFun(const std::function<void(shared_ptr<Node>)> &replaceFun);
    void setAttribute(const std::weak_ptr<Attribute>& attribute);

    void setParent(const std::weak_ptr<Node>& parent);

    Signal* getOnChangedSignal();
    weak_ptr<Attribute> getAttribute();
    Organism* getOrganismRaw();
    Node* getParentRaw();

    virtual ~Node() = default;
};

class NumberNode : public Node {
public:
    NumberNode() {}
    explicit NumberNode(std::string id) : Node(std::move(id)) {}

    float value;

    float getValue() const;

    NumberNode(float value) { this->value = value; }

    static shared_ptr<NumberNode> make(float value);

    float eval(const EvalContext &evalContext) override;
    void setAttributeForChildren(weak_ptr<Attribute> attribute) override {}
};


class BinaryOpNode : public Node {
public:
    // public READONLY
    shared_ptr<Node> a;
    shared_ptr<Node> b;

    explicit BinaryOpNode(std::string id) : Node(std::move(id)) {}

    static void setA(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& a);
    static void setB(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& a);
    static void set(const shared_ptr<BinaryOpNode>& op, const shared_ptr<Node>& a, const shared_ptr<Node>& b);

    Node* getA() {
        return a.get();
    }

    Node* getB() {
        return b.get();
    }

    void setAttributeForChildren(weak_ptr<Attribute> attribute) override;
};


class AddOpNode : public BinaryOpNode {
public:
    explicit AddOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static shared_ptr<AddOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }
};

class SubOpNode : public BinaryOpNode {
public:
    explicit SubOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static shared_ptr<SubOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) - this->b->eval(evalContext);
    }
};

class MulOpNode : public BinaryOpNode {
public:
    explicit MulOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static shared_ptr<MulOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) * this->b->eval(evalContext);
    }
};

class DivOpNode : public BinaryOpNode {
public:
    explicit DivOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static shared_ptr<DivOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) / this->b->eval(evalContext);
    }
};

class ModOpNode : public BinaryOpNode {
public:
    explicit ModOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static shared_ptr<ModOpNode> make(const shared_ptr<Node>& a, const shared_ptr<Node>& b, const std::string& id = Code::generateUuidV4());

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
//        auto aNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 0);
//        auto bNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 1);
//        auto addNode = std::make_shared<AddOpNode>(aNode, bNode);
//        auto twoNode = std::make_shared<NumberNode>(2.0f);
//        auto divNode = std::make_shared<DivOpNode>(addNode, twoNode);
//        node->rootNode = divNode;
        return node;
    }

    void setAttributeForChildren(weak_ptr<Attribute> attribute) override;
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

    void setAttributeForChildren(weak_ptr<Attribute> attribute) override {}
};


class AttributeReferenceNode : public Node {
public:
    weak_ptr<Attribute> reference;

    explicit AttributeReferenceNode(weak_ptr<Attribute> reference) { this->reference = reference; }
    explicit AttributeReferenceNode(weak_ptr<Attribute> reference, std::string id) : Node(std::move(id)) { this->reference = reference; }

    static shared_ptr<AttributeReferenceNode> make(Attribute* reference);

    Attribute* getReferenceRaw() {
        return reference.lock().get();
    }

    float eval(const EvalContext &evalContext) override;
    void setAttributeForChildren(weak_ptr<Attribute> attribute) override {}
};


#endif //EXPRESSO_NODE_H
