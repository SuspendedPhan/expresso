#include <iostream>
#include "Node.h"
#include "Attribute.h"

int main() {
    std::cout << "Hello, World!" << std::endl;

    const auto &node0 = std::make_shared<AddOpNode>(std::make_shared<NumberNode>(0.0f), std::make_shared<NumberNode>(10.0f));
    EditableAttribute attribute("attr", node0, weak_ptr<Organism>());
    node0->replace(std::make_shared<NumberNode>(0.0f));

    return 0;
}