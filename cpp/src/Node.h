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
using unique_ptr = std::unique_ptr<T>;

class ParameterNode;

class Attribute;

class Node {
private:
    std::string id;
    std::function<void(std::unique_ptr<Node>)> replaceFun;
    Attribute* attribute;
    Node* parent;
protected:
    Signal onChangedSignal;
    virtual void setAttributeForChildren(Attribute* attribute) = 0;
public:
    Node() : id(Code::generateUuidV4()) {}
    explicit Node(std::string id) : id(std::move(id)) {}

    virtual float eval(const EvalContext &evalContext) = 0;
    std::string getId() { return this->id; }
    void replace(std::unique_ptr<Node> node);
    void setReplaceFun(const std::function<void(std::unique_ptr<Node>)> &replaceFun);
    void setAttribute(Attribute* attribute);

    void setParent(Node* parent);

    Signal* getOnChangedSignal();
    Attribute* getAttribute();
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

    static std::unique_ptr<NumberNode> make(float value);

    float eval(const EvalContext &evalContext) override;
    void setAttributeForChildren(Attribute* attribute) override {}
};


class BinaryOpNode : public Node {
public:
    // public READONLY
    std::unique_ptr<Node> a;
    std::unique_ptr<Node> b;

    explicit BinaryOpNode(std::string id) : Node(std::move(id)) {}

    static void setA(BinaryOpNode * op, std::unique_ptr<Node> a);
    static void setB(BinaryOpNode * op, std::unique_ptr<Node> a);
    static void set(BinaryOpNode * op, std::unique_ptr<Node> a, std::unique_ptr<Node> b);

    Node* getA() {
        return a.get();
    }

    Node* getB() {
        return b.get();
    }

    void setAttributeForChildren(Attribute* attribute) override;
};


class AddOpNode : public BinaryOpNode {
public:
    explicit AddOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static std::unique_ptr<AddOpNode> make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }
};

class SubOpNode : public BinaryOpNode {
public:
    explicit SubOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static std::unique_ptr<SubOpNode> make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) - this->b->eval(evalContext);
    }
};

class MulOpNode : public BinaryOpNode {
public:
    explicit MulOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static std::unique_ptr<MulOpNode> make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) * this->b->eval(evalContext);
    }
};

class DivOpNode : public BinaryOpNode {
public:
    explicit DivOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static std::unique_ptr<DivOpNode> make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) / this->b->eval(evalContext);
    }
};

class ModOpNode : public BinaryOpNode {
public:
    explicit ModOpNode(std::string id) : BinaryOpNode(std::move(id)) {}

    static std::unique_ptr<ModOpNode> make(std::unique_ptr<Node> a, std::unique_ptr<Node> b, const std::string& id = Code::generateUuidV4());

    float eval(const EvalContext &evalContext) override {
        float aEval = this->a->eval(evalContext);
        float bEval = this->b->eval(evalContext);
        float answer = fmod(aEval, bEval);
        return answer;
    }
};

class FunctionNode : public Node {
public:
    vector<std::unique_ptr<Node>> arguments;
    std::unique_ptr<Node> rootNode;

    float eval(const EvalContext &evalContext) override {
        printf("function eval\n");
        return this->rootNode->eval(evalContext);
    }

    static std::unique_ptr<FunctionNode> makeAverage() {
        std::unique_ptr<FunctionNode> node = std::make_unique<FunctionNode>();
//        auto aNode = std::make_unique<ParameterNode>(std::FunctionNode*(node), 0);
//        auto bNode = std::make_unique<ParameterNode>(std::FunctionNode*(node), 1);
//        auto addNode = std::make_unique<AddOpNode>(aNode, bNode);
//        auto twoNode = std::make_unique<NumberNode>(2.0f);
//        auto divNode = std::make_unique<DivOpNode>(addNode, twoNode);
//        node->rootNode = divNode;
        return node;
    }

    void setAttributeForChildren(Attribute* attribute) override;
};

class ParameterNode : public Node {
public:
    FunctionNode* fun;
    int parameterIndex;

    ParameterNode(FunctionNode* fun,
            int parameterIndex) {
        this->fun = fun;
        this->parameterIndex = parameterIndex;
    }

    float eval(const EvalContext &evalContext) override {
        return this->fun->arguments[this->parameterIndex]->eval(evalContext);
    }

    void setAttributeForChildren(Attribute* attribute) override {}
};


class AttributeReferenceNode : public Node {
public:
    Attribute* reference;

    explicit AttributeReferenceNode(Attribute* reference) { this->reference = reference; }
    explicit AttributeReferenceNode(Attribute* reference, std::string id) : Node(std::move(id)) { this->reference = reference; }

    static std::unique_ptr<AttributeReferenceNode> make(Attribute* reference);

    Attribute* getReferenceRaw() {
        return reference;
    }

    float eval(const EvalContext &evalContext) override;
    void setAttributeForChildren(Attribute* attribute) override {}
};


#endif //EXPRESSO_NODE_H
