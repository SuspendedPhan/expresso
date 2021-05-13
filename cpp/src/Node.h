#ifndef EXPRESSO_NODE_H
#define EXPRESSO_NODE_H

#include "Attribute.h"
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
class Node;

class NodeBuilder;

using ReplaceFun = std::function<void(NodeBuilder newNode)>;
using BuildNodeFun = std::function<shared_ptr<Node>(ReplaceFun)>;


class NodeBuilder {
private:
    std::weak_ptr<Node> builtNode;

public:
    BuildNodeFun buildNodeFun;

    NodeBuilder(BuildNodeFun buildNodeFun) : buildNodeFun(buildNodeFun) {}

    shared_ptr<Node> build(ReplaceFun replaceFun) {
        const shared_ptr<Node> &builtNode = this->buildNodeFun(replaceFun);
        this->builtNode = builtNode;
        return builtNode;
    }

    template<typename T>
    std::weak_ptr<T> getBuiltNode() {
        return std::static_pointer_cast<T>(this->builtNode.lock());
    }
};


class Node {
private:
    ReplaceFun replaceFun;
public:
    Node(ReplaceFun replaceFun) : replaceFun(replaceFun) {}
    void replace(NodeBuilder newNode) { this->replaceFun(newNode); }
    virtual float eval(const EvalContext &evalContext) = 0;
    virtual ~Node() = default;
};

class NumberNode : public Node {
public:
    float value;

    NumberNode(float value, ReplaceFun replaceFun) : Node(replaceFun), value(value) {}

    float eval(const EvalContext &evalContext) override;

    static NodeBuilder startBuild(float value) {
        BuildNodeFun buildFun = [value](ReplaceFun replaceFun) {
            return std::make_shared<NumberNode>(value, replaceFun);
        };
        return NodeBuilder(buildFun);
    }
};

class BinaryOpNode : public Node {
public:
    shared_ptr<Node> a;
    shared_ptr<Node> b;

    BinaryOpNode(NodeBuilder a, NodeBuilder b, ReplaceFun replaceFun) : Node(replaceFun) {
        this->replaceA(a);
        this->replaceB(b);
    }

    void replaceA(NodeBuilder a) {
        this->a = a.build(std::bind(&BinaryOpNode::replaceA, this, std::placeholders::_1));
    }

    void replaceB(NodeBuilder b) {
        this->b = b.build(std::bind(&BinaryOpNode::replaceB, this, std::placeholders::_1));
    }
};


class AddOpNode : public BinaryOpNode {
public:
    AddOpNode(NodeBuilder a, NodeBuilder b, ReplaceFun replaceFun) : BinaryOpNode(a, b, replaceFun) {}

    float eval(const EvalContext &evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }

    static NodeBuilder startBuild(NodeBuilder a, NodeBuilder b) {
        BuildNodeFun buildFun = [a, b](ReplaceFun replaceFun) {
            return std::make_shared<AddOpNode>(a, b, replaceFun);
        };
        return NodeBuilder(buildFun);
    }
};



#endif //EXPRESSO_NODE_H
