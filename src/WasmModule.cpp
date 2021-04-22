#include <emscripten/bind.h>

using namespace emscripten;

class OrganismOutput;
class AttributeOutput;
class Attribute;
class Organism;
class Node;

class AttributeOutput {
    public:
        float value;
        std::string name;

        float getValue() {
            return this->value;
        }

        std::string getName() {
            return this->name;
        }
};

class OrganismOutput {
    public:
        std::vector<AttributeOutput> attributes;
        std::vector<OrganismOutput> suborganisms;

        std::vector<AttributeOutput> getAttributes() {
            return this->attributes;
        }

        std::vector<OrganismOutput> getSuborganisms() {
            return this->suborganisms;
        }
};

class EvalOutput {
    public:
        OrganismOutput rootOrganism;
        OrganismOutput* getRootOrganism() {
            return &this->rootOrganism;
        }
};


class Node {
    public:
        virtual float eval() = 0;
};

class FunctionNode : Node {
};

class NumberNode : public Node {
public:
    float value;
    float eval() override {
        printf("number eval\n");
        return this->value;
    }
};

class AttributeReferenceNode : Node {
};

class Attribute {
    public:
        std::shared_ptr<Node> rootNode;
        std::string name;

        static Attribute makeNumber(std::string name, float value) {
            Attribute attribute;
            NumberNode numberNode;
            numberNode.value = value;
            attribute.rootNode = std::make_shared<NumberNode>(numberNode);
            attribute.name = name;
            return attribute;
        }

        AttributeOutput eval() {
            AttributeOutput output;
            float value = this->rootNode->eval();
            output.value = value;
            output.name = this->name;
            return output;
        }
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


class ExpressorTree {
    public:
        EvalOutput* eval() {
            printf("expressor eval\n");
            auto evalOutput = new EvalOutput();
            evalOutput->rootOrganism = this->rootOrganism->eval();
            return evalOutput;
        }

        static EvalOutput* test() {
            printf("static eval\n");
            ExpressorTree tree;
            tree.rootOrganism = std::make_shared<Organism>();
            Attribute xAttribute = Attribute::makeNumber("x", 15);
            tree.rootOrganism->attributes.emplace_back(std::make_shared<Attribute>(xAttribute));

            Attribute yAttribute = Attribute::makeNumber("y", 15);
            tree.rootOrganism->attributes.emplace_back(std::make_shared<Attribute>(yAttribute));

            return tree.eval();
            return new EvalOutput();
        }

        static void hi() {
            printf("hi\n");
        }

    private:
        int clones;
        std::shared_ptr<Organism> rootOrganism;
};

int say_hello() {
  printf("Hello from your wasm module\n");
  return 0;
}

int yoyo() {
  printf("Hello from your wasm module\n");
  return 0;
}

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
    .function("getAttributes", &OrganismOutput::getAttributes)
    .function("getSuborganisms", &OrganismOutput::getSuborganisms)
  ;

  class_<AttributeOutput>("AttributeOutput")
      .function("getValue", &AttributeOutput::getValue)
      .function("getName", &AttributeOutput::getName)
  ;

  register_vector<OrganismOutput>("OrganismOutputVector");
  register_vector<AttributeOutput>("AttributeOutputVector");
}