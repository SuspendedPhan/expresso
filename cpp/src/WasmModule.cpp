#include <ctime>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include "Attribute.h"
#include "Organism.h"
#include "Node.h"
#include "EvalContext.h"
#include "EvalOutput.h"
#include "WasmModule.h"

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

class OrganismOutput;

class AttributeOutput;

class Organism;

class Node;

class FunctionNode;

class ParameterNode;

void ExpressorTree::populateTestTree(ExpressorTree &tree) {
    auto rootOrganism = tree.rootOrganism;

    const auto &cloneCountAttribute = rootOrganism->cloneCountAttribute;
    const shared_ptr<NumberNode> &tempCloneCountNode = std::make_shared<NumberNode>(10.0f);
    rootOrganism->cloneCountAttribute.lock()->setRootNode(tempCloneCountNode);
    const shared_ptr<NumberNode> &temp2 = std::make_shared<NumberNode>(20.0f);
    tempCloneCountNode->replace(temp2);
    temp2->replace(std::make_shared<NumberNode>(5.0f));

    auto mulNode = std::make_shared<MulOpNode>(
            std::make_shared<DivOpNode>(std::make_shared<AttributeReferenceNode>(rootOrganism->cloneNumberAttribute),
                    std::make_shared<AttributeReferenceNode>(cloneCountAttribute)),
            std::make_shared<MulOpNode>(std::make_shared<NumberNode>(3000.0f),
                    std::make_shared<ModOpNode>(std::make_shared<AttributeReferenceNode>(tree.timeAttribute),
                            std::make_shared<NumberNode>(1.0f))));

    const shared_ptr<EditableAttribute> &xAttribute = std::make_shared<EditableAttribute>(
            EditableAttribute("x", rootOrganism));
    xAttribute->setRootNode(mulNode);
    tree.rootOrganism->attributes.emplace_back(
            xAttribute);

    const shared_ptr<NumberNode> &yA = std::make_shared<NumberNode>(10.0f);
    const auto &yNode = std::make_shared<AddOpNode>(yA, std::make_shared<NumberNode>(0.0f));
    yA->replace(std::make_shared<NumberNode>(100.0f));

    const shared_ptr<EditableAttribute> &yAttribute = std::make_shared<EditableAttribute>("y", rootOrganism);
    yAttribute->setRootNode(yNode);
    tree.rootOrganism->attributes.emplace_back(yAttribute);

    rootOrganism->addSuborganism("sub");

    const auto &suborganism = rootOrganism->suborganisms.back();
//    suborganism->cloneCountAttribute.lock()->setRootNode(std::make_shared<NumberNode>(5.0f));
    
    const shared_ptr<AttributeReferenceNode> &xChildNode = std::make_shared<AttributeReferenceNode>(xAttribute);
    const shared_ptr<EditableAttribute> &xChildAttribute = std::make_shared<EditableAttribute>("x", suborganism);
    xChildAttribute->setRootNode(xChildNode);
    suborganism->attributes.emplace_back(xChildAttribute);
    
    const shared_ptr<AddOpNode> &yChildNode = std::make_shared<AddOpNode>(
            std::make_shared<AttributeReferenceNode>(yAttribute),
            std::make_shared<NumberNode>(100.0f));
    const shared_ptr<EditableAttribute> &yChildAttribute = std::make_shared<EditableAttribute>("y", suborganism);
    yChildAttribute->setRootNode(yChildNode);
    suborganism->attributes.emplace_back(yChildAttribute);
//    suborganism->remove();

    mulNode->replace(std::make_shared<NumberNode>(10.0f));
}

void ExpressorTree::populateTestTree2(ExpressorTree &tree) {
    auto rootOrganism = tree.rootOrganism;

    const shared_ptr<EditableAttribute> &xAttribute = std::make_shared<EditableAttribute>("x", rootOrganism);
    xAttribute->setRootNode(std::make_shared<NumberNode>(0.0f));
    rootOrganism->attributes.emplace_back(xAttribute);
    const shared_ptr<EditableAttribute> &yAttribute = std::make_shared<EditableAttribute>("y", rootOrganism);
    yAttribute->setRootNode(std::make_shared<NumberNode>(0.0f));
    rootOrganism->attributes.emplace_back(yAttribute);
}


int say_hello() {
    printf("Hello from your wasm module\n");
    return 0;
}

#ifndef __EMSCRIPTEN__
#define __EMSCRIPTEN__
#endif

#ifdef __EMSCRIPTEN__

#include "Fakebook.h"
#include "EmbindUtil.h"
#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(my_module) {
    function("sayHello", &say_hello);

    class_<ExpressorTree>("ExpressorTree")
            .constructor<>()
            .function("eval", &ExpressorTree::eval, allow_raw_pointers())
            .function("getRootOrganism", &ExpressorTree::getRootOrganism, allow_raw_pointers())
            .class_function("populateTestTree", &ExpressorTree::populateTestTree, allow_raw_pointers())
            .class_function("populateTestTree2", &ExpressorTree::populateTestTree2, allow_raw_pointers());

    class_<Organism>("Organism")
            .function("getSuborganisms", &Organism::getSuborganisms)
            .function("getAttributes", &Organism::getAttributes)
            .function("getName", &Organism::getName)
            .function("getId", &Organism::getId);

    class_<Attribute>("Attribute")
            .function("getName", &Attribute::getName)
            .function("getId", &Attribute::getId);

    class_<EditableAttribute, base<Attribute>>("EditableAttribute")
            .function("getRootNode", &EditableAttribute::getRootNode, allow_raw_pointers())
            .function("getOnChangedSignal", &EditableAttribute::getOnChangedSignal, allow_raw_pointers());

    class_<Node>("Node")
            .smart_ptr<std::shared_ptr<Node>>("Node")
            .function("getId", &Node::getId)
            .function("replace", &Node::replace)
            .function("getOnChangedSignal", &Node::getOnChangedSignal, allow_raw_pointers())
            .function("getOrganismRaw", &Node::getOrganismRaw, allow_raw_pointers());

    class_<BinaryOpNode, base<Node>>("BinaryOpNode")
            .function("getA", &BinaryOpNode::getA, allow_raw_pointers())
            .function("getB", &BinaryOpNode::getB, allow_raw_pointers());

    class_<AttributeReferenceNode, base<Node>>("AttributeReferenceNode")
            .function("getReferenceRaw", &AttributeReferenceNode::getReferenceRaw, allow_raw_pointers());

    class_<AddOpNode, base<BinaryOpNode>>("AddOpNode")
            .smart_ptr<std::shared_ptr<AddOpNode>>("AddOpNode")
            .class_function("make", &AddOpNode::make);

    class_<SubOpNode, base<BinaryOpNode>>("SubOpNode")
            .smart_ptr<std::shared_ptr<SubOpNode>>("SubOpNode")
            .class_function("make", &SubOpNode::make);

    class_<MulOpNode, base<BinaryOpNode>>("MulOpNode")
            .smart_ptr<std::shared_ptr<MulOpNode>>("MulOpNode")
            .class_function("make", &MulOpNode::make);

    class_<DivOpNode, base<BinaryOpNode>>("DivOpNode")
            .smart_ptr<std::shared_ptr<DivOpNode>>("DivOpNode")
            .class_function("make", &DivOpNode::make);

    class_<ModOpNode, base<BinaryOpNode>>("ModOpNode")
            .smart_ptr<std::shared_ptr<ModOpNode>>("ModOpNode")
            .class_function("make", &ModOpNode::make);

    class_<NumberNode, base<Node>>("NumberNode")
            .smart_ptr<std::shared_ptr<NumberNode>>("NumberNode")
            .function("getValue", &NumberNode::getValue)
            .class_function("make", &NumberNode::make);

    class_<EvalOutput>("EvalOutput")
            .function("getRootOrganism", &EvalOutput::getRootOrganism, allow_raw_pointers());

    class_<OrganismOutput>("OrganismOutput")
            .function("getCloneOutputByCloneNumber", &OrganismOutput::getCloneOutputByCloneNumber);

    class_<OrganismCloneOutput>("OrganismCloneOutput")
            .function("getAttributes", &OrganismCloneOutput::getAttributes)
            .function("getSuborganisms", &OrganismCloneOutput::getSuborganisms);

    class_<AttributeOutput>("AttributeOutput")
            .function("getValue", &AttributeOutput::getValue)
            .function("getName", &AttributeOutput::getName);

    class_<Signal>("Signal");

    class_<EmbindUtil>("EmbindUtil")
            .class_function("setSignalListener", &EmbindUtil::setSignalListener, allow_raw_pointers());


    class_<FakeBook>("FakeBook")
            .constructor<>()
            .function("getValue", &FakeBook::getValue)
            .function("setValue", &FakeBook::setValue)
            .function("subscribeOnValueChanged", &FakeBook::subscribeOnValueChanged)
            .function("subscribeOnChildrenChanged", &FakeBook::subscribeOnChildrenChanged)
            .function("addChild", &FakeBook::addChild)
            .function("remove", &FakeBook::remove)
            .function("getId", &FakeBook::getId)
            .function("getChildren", &FakeBook::getChildren, allow_raw_pointers())
            .class_function("make", &FakeBook::make, allow_raw_pointers());

    class_<std::function<void()>>("FunctionVoid")
            .constructor<>()
            .function("opcall", &std::function<void()>::operator());

    register_vector<Organism *>("OrganismVector");
    register_vector<Attribute *>("AttributeVector");
    register_vector<OrganismOutput>("OrganismOutputVector");
    register_vector<OrganismCloneOutput>("OrganismCloneOutputVector");
    register_vector<AttributeOutput>("AttributeOutputVector");
    register_vector<FakeBook *>("FakeBookVector");
}

#endif


