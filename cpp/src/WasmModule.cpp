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


//    auto qq = rootOrganism->cloneNumberAttribute;
//    auto context = EvalContext();
//    context.organismEvalContextByOrganism[rootOrganism]->currentCloneNumber = 0;
//    std::make_shared<AttributeReferenceNode>(qq)->eval(context);
    
//
    const auto &cloneCountAttribute = rootOrganism->cloneCountAttribute;
//    auto xAttribute = std::make_shared<EditableAttribute>("x", std::make_shared<NumberNode>(0.0f), rootOrganism);
//    tree.rootOrganism->attributes.emplace_back(xAttribute);
//    const auto &cloneNumberAttribute = rootOrganism->cloneNumberAttribute;
//    tree.rootOrganism->attributes.emplace_back(std::make_shared<EditableAttribute>("y", std::make_shared<AttributeReferenceNode>(
//            xAttribute), rootOrganism));



    rootOrganism->cloneCountAttribute.lock()->rootNode = std::make_shared<NumberNode>(10.0f);

    auto mulNode = std::make_shared<MulOpNode>(
            std::make_shared<DivOpNode>(std::make_shared<AttributeReferenceNode>(rootOrganism->cloneNumberAttribute),
                    std::make_shared<AttributeReferenceNode>(cloneCountAttribute)),
            std::make_shared<MulOpNode>(std::make_shared<NumberNode>(3000.0f),
                    std::make_shared<ModOpNode>(std::make_shared<AttributeReferenceNode>(tree.timeAttribute),
                            std::make_shared<NumberNode>(1.0f))));

    const shared_ptr<EditableAttribute> &xAttribute = std::make_shared<EditableAttribute>(
            EditableAttribute("x", mulNode, rootOrganism));
    tree.rootOrganism->attributes.emplace_back(
            xAttribute);

    const shared_ptr<EditableAttribute> &yAttribute = std::make_shared<EditableAttribute>("y",
            std::make_unique<NumberNode>(100.0f), rootOrganism);
    tree.rootOrganism->attributes.emplace_back(yAttribute);

    Organism::addSuborganism(rootOrganism);
    const auto &suborganism = rootOrganism->suborganisms.back();
    suborganism->attributes.emplace_back(
            std::make_shared<EditableAttribute>("x", std::make_shared<AttributeReferenceNode>(xAttribute),
                    suborganism));
    suborganism->attributes.emplace_back(
            std::make_shared<EditableAttribute>("y",
                    std::make_shared<AddOpNode>(std::make_shared<AttributeReferenceNode>(yAttribute),
                            std::make_shared<MulOpNode>(
                                    std::make_shared<AttributeReferenceNode>(suborganism->cloneCountAttribute),
                                    std::make_shared<NumberNode>(100.0f))), suborganism));
    Organism::remove(suborganism);

}


int say_hello() {
    printf("Hello from your wasm module\n");
    return 0;
}

#include "FakeBook.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS(my_module) {
  function("sayHello", &say_hello);

  class_<ExpressorTree>("ExpressorTree")
    .constructor<>()
    .function("eval", &ExpressorTree::eval, allow_raw_pointers())
    .class_function("populateTestTree", &ExpressorTree::populateTestTree, allow_raw_pointers())
  ;

  class_<EvalOutput>("EvalOutput")
    .function("getRootOrganism", &EvalOutput::getRootOrganism, allow_raw_pointers())
  ;

  class_<OrganismOutput>("OrganismOutput")
    .function("getCloneOutputByCloneNumber", &OrganismOutput::getCloneOutputByCloneNumber)
  ;

  class_<OrganismCloneOutput>("OrganismCloneOutput")
    .function("getAttributes", &OrganismCloneOutput::getAttributes)
    .function("getSuborganisms", &OrganismCloneOutput::getSuborganisms)
  ;

  class_<AttributeOutput>("AttributeOutput")
      .function("getValue", &AttributeOutput::getValue)
      .function("getName", &AttributeOutput::getName)
  ;

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
      .class_function("make", &FakeBook::make, allow_raw_pointers())
  ;

  register_vector<OrganismOutput>("OrganismOutputVector");
  register_vector<OrganismCloneOutput>("OrganismCloneOutputVector");
  register_vector<AttributeOutput>("AttributeOutputVector");
  register_vector<FakeBook*>("FakeBookVector");
}

#endif


