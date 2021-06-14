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


#ifndef __EMSCRIPTEN__
#define __EMSCRIPTEN__
#endif

#ifdef __EMSCRIPTEN__

#include "Fakebook.h"
#include "EmbindUtil.h"
#include "Project.h"
#include "Car.h"
#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(my_module) {
    class_<ExpressorTree>("ExpressorTree")
            .constructor<>()
            .function("eval", &ExpressorTree::eval, allow_raw_pointers())
            .function("getRootOrganism", &ExpressorTree::getRootOrganism, allow_raw_pointers());

    class_<Project>("Project")
            .constructor<>()
            .function("evalOrganismTree", &Project::evalOrganismTree, allow_raw_pointers())
            .function("getRootOrganism", &Project::getRootOrganism, allow_raw_pointers())
            .function("getId", &Project::getId)
            .function("setRootOrganism", &Project::setRootOrganism)
            .class_function("makeRootOrganism", &Project::makeRootOrganism)
            ;

    class_<Organism>("Organism")
            .function("getSuborganisms", &Organism::getSuborganisms)
            .function("getAttributes", &Organism::getAttributes)
            .function("getName", &Organism::getName)
            .function("getId", &Organism::getId);

    class_<Attribute>("Attribute")
            .function("getName", &Attribute::getName)
            .function("getId", &Attribute::getId)
            .function("getIsCloneNumberAttribute", &Attribute::getIsCloneNumberAttribute)
            .function("getIsEditableAttribute", &Attribute::getIsEditableAttribute)
            .function("getIsIntrinsicAttribute", &Attribute::getIsIntrinsicAttribute)
            ;

    class_<EditableAttribute, base<Attribute>>("EditableAttribute")
            .function("getRootNode", &EditableAttribute::getRootNode, allow_raw_pointers())
            .function("getOnChangedSignal", &EditableAttribute::getOnChangedSignal, allow_raw_pointers());

    class_<CloneNumberAttribute, base<Attribute>>("CloneNumberAttribute");

    class_<Node>("Node")
            .smart_ptr<std::shared_ptr<Node>>("Node")
            .function("getId", &Node::getId)
            .function("replace", &Node::replace)
            .function("getOnChangedSignal", &Node::getOnChangedSignal, allow_raw_pointers())
            .function("getOrganismRaw", &Node::getOrganismRaw, allow_raw_pointers())
            .function("getParentRaw", &Node::getParentRaw, allow_raw_pointers());

    class_<BinaryOpNode, base<Node>>("BinaryOpNode")
            .function("getA", &BinaryOpNode::getA, allow_raw_pointers())
            .function("getB", &BinaryOpNode::getB, allow_raw_pointers());

    class_<AttributeReferenceNode, base<Node>>("AttributeReferenceNode")
            .smart_ptr<std::shared_ptr<AttributeReferenceNode>>("AttributeReferenceNode")
            .function("getReferenceRaw", &AttributeReferenceNode::getReferenceRaw, allow_raw_pointers())
            .class_function("make", &AttributeReferenceNode::make, allow_raw_pointers());

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

    class_<Car>("Car")
            .function("getId", &Car::getId)
            .function("setId", &Car::setId)
            .class_function("make", &std::make_unique<Car, int>)
            .class_function("make", &std::make_unique<Car>)
            .function("setChild", &Car::setChild)
            .function("getChild", &Car::getChild, allow_raw_pointers())
            ;

    register_vector<Organism *>("OrganismVector");
    register_vector<Attribute *>("AttributeVector");
    register_vector<OrganismOutput>("OrganismOutputVector");
    register_vector<OrganismCloneOutput>("OrganismCloneOutputVector");
    register_vector<AttributeOutput>("AttributeOutputVector");
    register_vector<FakeBook *>("FakeBookVector");
}

#endif


