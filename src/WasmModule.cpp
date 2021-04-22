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

class OrganismCloneOutput {
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


class OrganismOutput {
    public:
        std::vector<OrganismCloneOutput> cloneOutputByCloneNumber;
        std::vector<OrganismCloneOutput> getCloneOutputByCloneNumber() {
            return this->cloneOutputByCloneNumber;
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
        virtual ~Node() = default;
};

class FunctionNode : Node {
};

class NumberNode : public Node {
public:
    float value;

    NumberNode(float value) { this->value = value; }

    float eval() override {
        printf("number eval\n");
        return this->value;
    }
};



class Attribute {
    public:
        std::shared_ptr<Node> rootNode;
        std::string name;

        static Attribute makeNumber(std::string name, float value) {
            Attribute attribute;
            NumberNode numberNode(value);
            attribute.rootNode = std::make_shared<NumberNode>(numberNode);
            attribute.name = name;
            return attribute;
        }

        static Attribute make(std::string name, std::unique_ptr<Node> rootNode) {
            Attribute attribute;
            attribute.name = name;
            attribute.rootNode = std::move(rootNode);
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

class AttributeReferenceNode : public Node {
    public:
        std::weak_ptr<Attribute> attribute;
        AttributeReferenceNode(std::weak_ptr<Attribute> attribute) { this->attribute = attribute; }

        float eval() {
            return attribute.lock()->eval().value;
        }
};

class Organism {
    public:
        OrganismOutput eval() {
            OrganismOutput output;
            OrganismCloneOutput cloneOutput;
            for (const auto &attribute : this->attributes) {
                cloneOutput.attributes.emplace_back(attribute->eval());
            }
            output.cloneOutputByCloneNumber.emplace_back(std::move(cloneOutput));
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
            Attribute xAttribute = Attribute::make("x", std::make_unique<NumberNode>(15));
            tree.rootOrganism->attributes.emplace_back(std::make_shared<Attribute>(xAttribute));

            const auto xAttributePtr = std::weak_ptr<Attribute>(tree.rootOrganism->attributes.back());
            Attribute yAttribute = Attribute::make("y", std::make_unique<AttributeReferenceNode>(xAttributePtr));
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

  register_vector<OrganismOutput>("OrganismOutputVector");
  register_vector<OrganismCloneOutput>("OrganismCloneOutputVector");
  register_vector<AttributeOutput>("AttributeOutputVector");
}