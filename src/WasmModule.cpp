#include <emscripten/bind.h>

using namespace emscripten;

class OrganismOutput;
class AttributeOutput;
class Attribute;
class Organism;
class Node;

class EvalOutput {
    public:
        std::shared_ptr<OrganismOutput> rootOrganism;
};

class OrganismOutput {
    public:
        std::vector<std::shared_ptr<AttributeOutput>> attributes;
        std::vector<std::shared_ptr<OrganismOutput>> organisms;
};

class AttributeOutput {
    public:
        float value;
};

class Node {
};

class Attribute {
    public:
        AttributeOutput eval() {
            AttributeOutput output;
            float value = this->rootNode->eval();
            output.value = value;
            return output;
        }
        std::shared_ptr<Node> rootNode;
};

class Organism {
    public:
        OrganismOutput eval() {
            OrganismOutput output;
            for (const auto &attribute : this->attributes) {
                output.attributes.emplace_back(attribute->eval());
            }
            return output;
        }
        std::vector<std::shared_ptr<Attribute>> attributes;
        std::vector<std::shared_ptr<Organism>> suborganisms;
};


class FunctionNode : Node {
};

class NumberNode : Node {
public:
    float value;
    float eval() {
        return this->value;
    }
};

class AttributeReferenceNode : Node {
};

class ExpressorTree {
    public:
        EvalOutput* eval() {
            auto evalOutput = new EvalOutput();
            auto rootOrganismOutput = new OrganismOutput(this->rootOrganism->eval());
            evalOutput->rootOrganism = std::make_shared<OrganismOutput>(std::move(rootOrganismOutput));
            return evalOutput;
        }

        static EvalOutput test() {
            ExpressorTree tree;
            tree.rootOrganism = std::make_shared<Organism>(new Organism());
            Attribute attribute;
            attribute.rootNode = make_shared<NumberNode>(new NumberNode());
            attribute.rootNode->value = 15;
            Attribute cloneCountAttribute;
            cloneCountAttribute.rootNode = NumberNode();
            cloneCountAttribute.rootNode->value = 3;
            tree.rootOrganism->attributes.emplace_back(attribute);
            tree.rootOrganism->attributes.emplace_back(cloneCountAttribute);
            tree.rootOrganism->cloneCountAttribute = std::make_weak(tree.rootOrganism->attributes.back());
            return tree.eval();
        }

    private:
        int clones;
        std::shared_ptr<Organism> rootOrganism;
};

int say_hello() {
  printf("Hello from your wasm module\n");
  return 0;
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("sayHello", &say_hello);

  class_<ExpressorTree>("ExpressorTree")
    .constructor<>()
    .function("setClones", &ExpressorTree::setClones)
    .function("eval", &ExpressorTree::eval, allow_raw_pointers())
  ;

  class_<EvalOutput>("EvalOutput")
    .constructor<>()
    .function("getRadius", &EvalOutput::getRadius)
    .function("getCloneCount", &EvalOutput::getCloneCount)
  ;
}