#include <iostream>
#include <vector>
#include "EvalOutput.h"
#include "Attribute.h"
#include "Node.h"
#include "Car.h"

std::pair<int, int> wer() {
    return std::make_pair(20, 20);
}

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << wer().first << std::endl;

//    Car car;
//    car.children.emplace_back(std::make_unique<Car>());
//    std::cout << car.children.back()->getId() << std::endl;

//    const auto node = std::make_shared<NumberNode>(0.0f);
//    const auto &attribute = std::make_shared<EditableAttribute>("attr", weak_ptr<Organism>());
//    attribute->setRootNode(node);
//
//    const shared_ptr<NumberNode> &left = std::make_shared<NumberNode>(0.0f);
//    const auto &node0 = AddOpNode::make(left, std::make_shared<NumberNode>(10.0f));
//    node->replace(node0);
//
//
//    std::cout << left->getParentRaw()->eval(EvalContext()) << std::endl;
//
//    std::cout << left->getAttribute().lock()->getName() << std::endl;
//    std::cout << left->getAttribute().lock()->eval(EvalContext()).getValue() << std::endl;

//    attribute->setRootNode(node0);
//    node0->replace(std::make_shared<NumberNode>(0.0f));

    return 0;
}
