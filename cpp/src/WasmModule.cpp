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

template<class Out>
std::unique_ptr<Out> make()
{
    return std::make_unique<Out>();
}

template<class Out, class In0>
std::unique_ptr<Out> make(In0 arg)
{
    return std::make_unique<Out>(std::move(arg));
}

template<class Out, class In0, class In1>
std::unique_ptr<Out> make(In0 arg0, In1 arg1)
{
    return std::make_unique<Out>(std::move(arg0), std::move(arg1));
}

template<class Out, class In0, class In1, class In2>
std::unique_ptr<Out> make(In0 arg0, In1 arg1, In2 arg2)
{
    return std::make_unique<Out>(std::move(arg0), std::move(arg1), std::move(arg2));
}

template<class Out, class In0, class In1, class In2, class In3>
std::unique_ptr<Out> make(In0 arg0, In1 arg1, In2 arg2, In3 arg3)
{
    return std::make_unique<Out>(std::move(arg0), std::move(arg1), std::move(arg2), std::move(arg3));
}

EMSCRIPTEN_BINDINGS(my_module) {
    class_<Project>("Project")
            .class_function("makeUnique", &make<Project, std::unique_ptr<Organism>>)
            .class_function("makeUnique", &make<Project, std::unique_ptr<Organism>, std::string>)
            .class_function("makeRootOrganism", &Project::makeRootOrganism)
            .function("evalOrganismTree", &Project::evalOrganismTree)
            .function("getRootOrganism", &Project::getRootOrganism, allow_raw_pointers())
            .function("getId", &Project::getId)
            .function("setRootOrganism", &Project::setRootOrganism, allow_raw_pointers())
            .function("getOnFunctionsChangedSignal", &Project::getOnFunctionsChangedSignal, allow_raw_pointers())
            .function("getFunctions", &Project::getFunctions, allow_raw_pointers())
            .function("addFunction", &Project::addFunction, allow_raw_pointers())
            ;

    class_<Organism>("Organism")
            .class_function("makeUnique", &make<Organism, std::string, std::string>)
            .function("getSuborganisms", &Organism::getSuborganisms)
            .function("addSuborganism", &Organism::addSuborganism)
            .function("getAttributes", &Organism::getAttributes)
            .function("addAttribute", &Organism::addAttribute)
            .function("getName", &Organism::getName)
            .function("getProject", &Organism::getProject, allow_raw_pointers())
            .function("getId", &Organism::getId);

    class_<Attribute>("Attribute")
            .function("getName", &Attribute::getName)
            .function("getId", &Attribute::getId)
            .function("getIsCloneNumberAttribute", &Attribute::getIsCloneNumberAttribute)
            .function("getIsEditableAttribute", &Attribute::getIsEditableAttribute)
            .function("getIsIntrinsicAttribute", &Attribute::getIsIntrinsicAttribute)
            ;

    class_<EditableAttribute, base<Attribute>>("EditableAttribute")
            .class_function("makeUnique", &make<EditableAttribute, std::string, Organism*>, allow_raw_pointers())
            .class_function("makeUnique", &make<EditableAttribute, std::string, Organism*, std::string>, allow_raw_pointers())
            .function("getRootNode", &EditableAttribute::getRootNode, allow_raw_pointers())
            .function("setRootNode", &EditableAttribute::setRootNode, allow_raw_pointers())
            .function("getOnChangedSignal", &EditableAttribute::getOnChangedSignal, allow_raw_pointers());

    class_<CloneNumberAttribute, base<Attribute>>("CloneNumberAttribute")
            .class_function("makeUnique", &make<CloneNumberAttribute, Organism*, std::string>, allow_raw_pointers());

    class_<IntrinsicAttribute, base<Attribute>>("IntrinsicAttribute")
            .class_function("makeUnique", &make<IntrinsicAttribute, std::string, Organism*, std::string>, allow_raw_pointers());

    class_<Node>("Node")
            .smart_ptr<std::shared_ptr<Node>>("Node")
            .function("getId", &Node::getId, allow_raw_pointers())
            .function("equals", &Node::equals, allow_raw_pointers())
            .function("replace", &Node::replace)
            .function("getOnChangedSignal", &Node::getOnChangedSignal, allow_raw_pointers())
            .function("getOrganism", &Node::getOrganism, allow_raw_pointers())
            .function("getParent", &Node::getParent, allow_raw_pointers())
            .function("getFunction", &Node::getFunction, allow_raw_pointers())
            .function("getProject", &Node::getProject, allow_raw_pointers())
            ;

    class_<BinaryOpNode, base<Node>>("BinaryOpNode")
            .class_function("setA", &BinaryOpNode::setA, allow_raw_pointers())
            .function("getA", &BinaryOpNode::getA, allow_raw_pointers())
            .function("getB", &BinaryOpNode::getB, allow_raw_pointers());

    class_<AttributeReferenceNode, base<Node>>("AttributeReferenceNode")
            .smart_ptr<std::shared_ptr<AttributeReferenceNode>>("AttributeReferenceNode")
            .function("getReferenceRaw", &AttributeReferenceNode::getReferenceRaw, allow_raw_pointers())
            .class_function("makeUnique", &make<AttributeReferenceNode, Attribute*, std::string>, allow_raw_pointers())
            .class_function("makeUnique", &make<AttributeReferenceNode, Attribute*>, allow_raw_pointers());

    class_<AddOpNode, base<BinaryOpNode>>("AddOpNode")
            .class_function("makeUnique", &make<AddOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<AddOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>, std::string>);

    class_<SubOpNode, base<BinaryOpNode>>("SubOpNode")
            .class_function("makeUnique", &make<SubOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<SubOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>, std::string>);

    class_<MulOpNode, base<BinaryOpNode>>("MulOpNode")
            .class_function("makeUnique", &make<MulOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<MulOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>, std::string>);

    class_<DivOpNode, base<BinaryOpNode>>("DivOpNode")
            .class_function("makeUnique", &make<DivOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<DivOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>, std::string>);

    class_<ModOpNode, base<BinaryOpNode>>("ModOpNode")
            .class_function("makeUnique", &make<ModOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<ModOpNode, std::unique_ptr<Node>, std::unique_ptr<Node>, std::string>);

    class_<NumberNode, base<Node>>("NumberNode")
            .function("getValue", &NumberNode::getValue)
            .class_function("makeUnique", &make<NumberNode, float>)
            .class_function("makeUnique", &make<NumberNode, float, std::string>);

    class_<FunctionCallNode, base<Node>>("FunctionCallNode")
            .class_function("makeUnique", &make<FunctionCallNode, Function *>, allow_raw_pointers())
            .class_function("makeUnique", &make<FunctionCallNode, Function *, std::string>, allow_raw_pointers())
            .function("setArgument", &FunctionCallNode::setArgument, allow_raw_pointers())
            .function("getName", &FunctionCallNode::getName)
            .function("getArgumentByParameterMap", &FunctionCallNode::getArgumentByParameterMap, allow_raw_pointers())
            .function("getFunction", &FunctionCallNode::getFunction, allow_raw_pointers())
            ;

    class_<ParameterNode, base<Node>>("ParameterNode")
            .class_function("makeUnique", &make<ParameterNode, FunctionParameter *>, allow_raw_pointers())
            .class_function("makeUnique", &make<ParameterNode, FunctionParameter *, std::string>, allow_raw_pointers())
            .function("getFunctionParameter", &ParameterNode::getFunctionParameter, allow_raw_pointers())
            ;

    class_<Function>("Function")
            .class_function("makeUnique", &make<Function, std::string, std::unique_ptr<Node>>)
            .class_function("makeUnique", &make<Function, std::string, std::unique_ptr<Node>, std::string>)
            .function("addParameter", &Function::addParameter)
            .function("getId", &Function::getId)
            .function("getName", &Function::getName)
            .function("getRootNode", &Function::getRootNode, allow_raw_pointers())
            .function("getOnChangedSignal", &Function::getOnChangedSignal, allow_raw_pointers())
            .function("getParameters", &Function::getParameters)
            .function("getProject", &Function::getProject, allow_raw_pointers());

    class_<FunctionParameter>("FunctionParameter")
            .class_function("makeUnique", &make<FunctionParameter, std::string>)
            .class_function("makeUnique", &make<FunctionParameter, std::string, std::string>)
            .function("getName", &FunctionParameter::getName)
            .function("getId", &FunctionParameter::getId);

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

    class_<NodeParent>("NodeParent")
            .function("isNode", &NodeParent::isNode, allow_raw_pointers())
            .function("isFunction", &NodeParent::isFunction, allow_raw_pointers())
            .function("isAttribute", &NodeParent::isAttribute, allow_raw_pointers())
            .function("getNode", &NodeParent::getNode, allow_raw_pointers())
            .function("getFunction", &NodeParent::getFunction, allow_raw_pointers())
            .function("getAttribute", &NodeParent::getAttribute, allow_raw_pointers())
            ;

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
            .class_function("make", &make<Car, std::unique_ptr<Driver>>)
            .function("setChild", &Car::setChild)
            .function("getChild", &Car::getChild, allow_raw_pointers())
            ;

    class_<Driver>("Driver")
            .class_function("make", &std::make_unique<Driver>);

    register_vector<Organism *>("OrganismVector");
    register_vector<Attribute *>("AttributeVector");
    register_vector<OrganismOutput *>("OrganismOutputVector");
    register_vector<OrganismCloneOutput *>("OrganismCloneOutputVector");
    register_vector<AttributeOutput *>("AttributeOutputVector");
    register_vector<FunctionParameter *>("FunctionParameterVector");
    register_vector<const FunctionParameter *>("FunctionParameterVectorConst");
    register_vector<Function *>("FunctionVector");
    register_vector<FakeBook *>("FakeBookVector");
    register_map<const FunctionParameter *, Node *>("FunctionParameterToNode");
}

#endif


