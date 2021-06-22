#ifndef EXPRESSO_NODE_H
#define EXPRESSO_NODE_H

#include "Attribute.h"
#include "Code.h"
#include "Signal.h"
#include "Function.h"
#include "FunctionParameter.h"
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
    Attribute* attribute = nullptr;
    Node* parent = nullptr;
protected:
    Signal onChangedSignal;
    virtual void setAttributeForChildren(Attribute* attribute) = 0;
public:
    Node() : id(Code::generateUuidV4()) {}
    explicit Node(std::string id) : id(std::move(id)) {}

    virtual float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) = 0;
    std::string getId() { return this->id; }
    void replace(std::unique_ptr<Node> node);
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
    float value;

    explicit NumberNode(float value) { this->value = value; }
    NumberNode(float value, std::string id) : value(value), Node(std::move(id)) {}

    float getValue() const;
    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;
    void setAttributeForChildren(Attribute* attribute) override {}
};


class BinaryOpNode : public Node {
public:
    // public READONLY
    std::unique_ptr<Node> a;
    std::unique_ptr<Node> b;

    explicit BinaryOpNode(std::string id) : Node(std::move(id)) {}

    BinaryOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) {
        set(this, std::move(a), std::move(b));
    }

    BinaryOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : Node(std::move(id)) {
        set(this, std::move(a), std::move(b));
    }

    static void setA(BinaryOpNode * op, std::unique_ptr<Node> a);
    static void setB(BinaryOpNode * op, std::unique_ptr<Node> a);
    static void set(BinaryOpNode * op, std::unique_ptr<Node> a, std::unique_ptr<Node> b);

    Node* getA() const {
        return a.get();
    }

    Node* getB() const {
        return b.get();
    }

    void setAttributeForChildren(Attribute* attribute) override;
};


class AddOpNode : public BinaryOpNode {
public:
    AddOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) : BinaryOpNode(std::move(a), std::move(b)) {}
    AddOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : BinaryOpNode(std::move(a), std::move(b), std::move(id)) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override {
        return this->a->eval(evalContext, nodeEvalContext) + this->b->eval(evalContext, nodeEvalContext);
    }
};

class SubOpNode : public BinaryOpNode {
public:
    SubOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) : BinaryOpNode(std::move(a), std::move(b)) {}
    SubOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : BinaryOpNode(std::move(a), std::move(b), std::move(id)) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override {
        return this->a->eval(evalContext, nodeEvalContext) - this->b->eval(evalContext, nodeEvalContext);
    }
};

class MulOpNode : public BinaryOpNode {
public:
    MulOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) : BinaryOpNode(std::move(a), std::move(b)) {}
    MulOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : BinaryOpNode(std::move(a), std::move(b), std::move(id)) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override {
        return this->a->eval(evalContext, nodeEvalContext) * this->b->eval(evalContext, nodeEvalContext);
    }
};

class DivOpNode : public BinaryOpNode {
public:
    DivOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) : BinaryOpNode(std::move(a), std::move(b)) {}
    DivOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : BinaryOpNode(std::move(a), std::move(b), std::move(id)) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override {
        return this->a->eval(evalContext, nodeEvalContext) / this->b->eval(evalContext, nodeEvalContext);
    }
};

class ModOpNode : public BinaryOpNode {
public:
    ModOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b) : BinaryOpNode(std::move(a), std::move(b)) {}
    ModOpNode(std::unique_ptr<Node> a, std::unique_ptr<Node> b, std::string id) : BinaryOpNode(std::move(a), std::move(b), std::move(id)) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override {
        float aEval = this->a->eval(evalContext, nodeEvalContext);
        float bEval = this->b->eval(evalContext, nodeEvalContext);
        float answer = fmod(aEval, bEval);
        return answer;
    }
};

class ParameterNode : public Node {
public:
    FunctionParameter * functionParameter;

    explicit ParameterNode(FunctionParameter *functionParameter) : functionParameter(functionParameter) {}

    ParameterNode(const std::string &id, FunctionParameter *functionParameter) : Node(id),
            functionParameter(functionParameter) {}

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;

    void setAttributeForChildren(Attribute* attribute) override {}
};

class FunctionCallNode : public Node {
public:
    FunctionCallNode(Function *function,
            map<const FunctionParameter *, std::unique_ptr<Node>> argumentByParameter);

    FunctionCallNode(Function *function,
            map<const FunctionParameter *, std::unique_ptr<Node>> &&argumentByParameter, std::string id);

    Function * function;
    std::map<const FunctionParameter *, std::unique_ptr<Node>> argumentByParameter;

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;
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

    float eval(const EvalContext &evalContext, NodeEvalContext &nodeEvalContext) override;
    void setAttributeForChildren(Attribute* attribute) override {}
};


#endif //EXPRESSO_NODE_H
