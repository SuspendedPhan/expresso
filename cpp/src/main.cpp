#include <iostream>
#include "Node.h"

int main() {
    std::cout << "Hello, World!" << std::endl;
    AddOpNode add(NumberNode::startBuild(10.0f), NumberNode::startBuild(20.0f), ReplaceFun());
    std::cout << add.eval(EvalContext()) << std::endl;
    add.a->replace(NumberNode::startBuild(50.0f));
    std::cout << add.eval(EvalContext()) << std::endl;


    NodeBuilder innerNode = NumberNode::startBuild(10.0f);
    AddOpNode add2(AddOpNode::startBuild(innerNode, NumberNode::startBuild(30.f)), NumberNode::startBuild(20.0f), ReplaceFun());
    std::cout << add2.eval(EvalContext()) << std::endl;

    const shared_ptr<Node> &ptr = innerNode.getBuiltNode<Node>().lock();
    const NodeBuilder &node = NumberNode::startBuild(20.0f);
    ptr->replace(node);
    std::cout << add2.eval(EvalContext()) << std::endl;


    return 0;
}
