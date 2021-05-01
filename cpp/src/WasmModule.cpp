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


//class LerpNode: public FunctionNode {
//    public:
//        LerpNode() {
//            // a + t * (b - a)
//            this->rootNode = Add(Param(0), Mul((Param(2), Sub(Param(1), Param(0)))));
//        }
//
//        static test() {
//            LerpNode lerpNode;
//            lerpNode.arguments.push_back(Num(5));
//            lerpNode.arguments.push_back(Num(10));
//            lerpNode.arguments.push_back(Num(.5));
//        }
//    }
//}
EvalOutput *ExpressorTree::test() {
    ExpressorTree tree;
    tree.rootOrganism = std::make_shared<Organism>();
    auto rootOrganism = tree.rootOrganism;
    auto addNode = std::make_shared<AddOpNode>(std::make_shared<NumberNode>(0.0f),
                                               std::make_shared<NumberNode>(500.0f));

    const EditableAttribute &xAttribute = EditableAttribute("x", addNode, weak_ptr<Organism>(rootOrganism));
    EditableAttribute test2 = xAttribute;
    EditableAttribute *px = new EditableAttribute("x", addNode, weak_ptr<Organism>(rootOrganism));
    std::shared_ptr<EditableAttribute> a(px);

//    tree.rootOrganism->attributes.emplace_back(
//            std::make_shared<EditableAttribute>(
//                    EditableAttribute("x", addNode, weak_ptr<Organism>(rootOrganism))));

//            EditableAttribute cloneCountAttribute = EditableAttribute("clones", std::make_unique<NumberNode>(3.0f), weak_ptr<Organism>(rootOrganism));
//            tree.rootOrganism->attributes.emplace_back(std::make_shared<EditableAttribute>(cloneCountAttribute));
//            tree.rootOrganism->cloneCountAttribute = weak_ptr<Attribute>(tree.rootOrganism->attributes.back());
//
//            tree.rootOrganism->attributes.emplace_back(
//                std::make_shared<CloneNumberAttribute>(
//                    CloneNumberAttribute(weak_ptr<Organism>(rootOrganism))));
//
//            const auto attributePtr = weak_ptr<Attribute>(tree.rootOrganism->attributes.back());
//            EditableAttribute yAttribute = EditableAttribute("y", std::make_unique<AttributeReferenceNode>(attributePtr), weak_ptr<Organism>(rootOrganism));
//            tree.rootOrganism->attributes.emplace_back(std::make_shared<EditableAttribute>(yAttribute));

    return new EvalOutput();
//            return tree.eval();
}


int say_hello() {
    printf("Hello from your wasm module\n");

    auto ww = new EditableAttribute2();
    delete ww;

    printf("after\n");
    return 0;
}

int yoyo() {
    printf("Hello from your wasm module\n");
    return 0;
}

#include "FakeBook.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS(my_module) {
  function("sayHello", &say_hello);
  function("yoyo", &yoyo);

  class_<ExpressorTree>("ExpressorTree")
    .constructor<>()
    .class_function("test", &ExpressorTree::test, allow_raw_pointers())
    .class_function("hi", &ExpressorTree::hi)
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


