#include <iostream>
#include <vector>
#include "EvalOutput.h"
#include "Attribute.h"
#include "Node.h"
#include "Car.h"
#include "Project.h"

int main() {
    std::cout << "Hello, World!" << std::endl;
    Project project(Project::makeRootOrganism());
//
//    auto rootOrganism = project.getRootOrganism();
//    const auto & xAttr = Code::find<std::unique_ptr<Attribute>>(rootOrganism->attributes, [&](const auto &attribute) { return attribute->name == "x"; });
//    const auto & yAttr = Code::find<std::unique_ptr<Attribute>>(rootOrganism->attributes, [&](const auto &attribute) { return attribute->name == "y"; });
//
//    auto xRef = std::make_unique<AttributeReferenceNode>(xAttr.get());
//    auto two = std::make_unique<NumberNode>(2.0f);
//    auto add = AddOpNode::make(std::move(xRef), std::move(two));
//
//    auto three = std::make_unique<NumberNode>(3.0f);
//    dynamic_cast<EditableAttribute *>(xAttr.get())->setRootNode(std::move(three));
//    dynamic_cast<EditableAttribute *>(yAttr.get())->setRootNode(std::move(add));
//
//    const auto evalOutput = project.evalOrganismTree();
//    const auto output = evalOutput->getRootOrganism();
//    for (const auto & attribute : output->cloneOutputByCloneNumber[0]->attributes) {
//        std::cout << attribute->name << std::endl;
//        std::cout << attribute->value << std::endl;
//        std::cout << std::endl;
//    }

    return 0;
}
