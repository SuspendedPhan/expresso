#include <emscripten/bind.h>
#include <string>

using namespace emscripten;
template <typename T>
using vector = std::vector<T>;
template <typename T, typename V>
using map = std::map<T, V>;
template <typename T>
using weak_ptr = std::weak_ptr<T>;
template <typename T>
using shared_ptr = std::shared_ptr<T>;
template <typename T>
using unique_ptr = std::unique_ptr<T>;


class OrganismOutput;
class AttributeOutput;
class Attribute;
class Organism;
class Node;
class FunctionNode;
class ParameterNode;

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
        vector<AttributeOutput> attributes;
        vector<OrganismOutput> suborganisms;

        vector<AttributeOutput> getAttributes() {
            return this->attributes;
        }

        vector<OrganismOutput> getSuborganisms() {
            return this->suborganisms;
        }
};


class OrganismOutput {
    public:
        vector<OrganismCloneOutput> cloneOutputByCloneNumber;
        vector<OrganismCloneOutput> getCloneOutputByCloneNumber() {
            return this->cloneOutputByCloneNumber;
        }
};


class EvalOutput {
    public:
        std::shared_ptr<OrganismOutput> rootOrganism;
        OrganismOutput* getRootOrganism() {
            return this->rootOrganism.get();
        }
};


class OrganismEvalContext {
public:
    weak_ptr<OrganismOutput> organismOutput;
    int currentCloneNumber;
};


class EvalContext {
public:
    std::map<weak_ptr<Organism>, std::shared_ptr<OrganismEvalContext>, std::owner_less<std::weak_ptr<Organism>>> organismEvalContextByOrganism;
};


class Node {
    public:
        virtual float eval(const EvalContext& evalContext) = 0;
        virtual ~Node() = default;
};

class NumberNode : public Node {
public:
    float value;

    NumberNode(float value) { this->value = value; }

    float eval(const EvalContext& evalContext) override {
        printf("number eval\n");
        return this->value;
    }
};

class BinaryOpNode: public Node {
public:
    shared_ptr<Node> a;
    shared_ptr<Node> b;

    BinaryOpNode(shared_ptr<Node> a, shared_ptr<Node> b) {
        this->a = a;
        this->b = b;
    }
};


class AddOpNode: public BinaryOpNode {
public:
    AddOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) + this->b->eval(evalContext);
    }
};

class SubOpNode: public BinaryOpNode {
public:
    SubOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) - this->b->eval(evalContext);
    }
};

class DivOpNode: public BinaryOpNode {
public:
    DivOpNode(shared_ptr<Node> a, shared_ptr<Node> b) : BinaryOpNode(a, b) {}

    float eval(const EvalContext& evalContext) override {
        return this->a->eval(evalContext) / this->b->eval(evalContext);
    }
};




class FunctionNode: public Node {
    public:
        vector<shared_ptr<Node>> arguments;
        shared_ptr<Node> rootNode;

        float eval(const EvalContext& evalContext) override {
            printf("function eval\n");
            return this->rootNode->eval(evalContext);
        }

        static shared_ptr<FunctionNode> makeAverage() {
            shared_ptr<FunctionNode> node = std::make_shared<FunctionNode>();
            auto aNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 0);
            auto bNode = std::make_shared<ParameterNode>(std::weak_ptr<FunctionNode>(node), 1);
            auto addNode = std::make_shared<AddOpNode>(aNode, bNode);
            auto twoNode = std::make_shared<NumberNode>(2);
            auto divNode = std::make_shared<DivOpNode>(addNode, twoNode);
            node->rootNode = divNode;
            return node;
        }
};

class ParameterNode: public Node {
    public:
        weak_ptr<FunctionNode> fun;
        int parameterIndex;

        ParameterNode(weak_ptr<FunctionNode> fun,
        int parameterIndex) {
            this->fun = fun;
            this->parameterIndex = parameterIndex;
        }

        float eval(const EvalContext& evalContext) override {
            return this->fun.lock()->arguments[this->parameterIndex]->eval(evalContext);
        }
};



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


class Attribute {
    public:
        std::string name;
        weak_ptr<Organism> organism;

        Attribute(std::string name, weak_ptr<Organism> organism) {
            this->name = name;
            this->organism = organism;
        }

        virtual AttributeOutput eval(const EvalContext& evalContext) = 0;
        virtual ~Attribute() {}
};

class EditableAttribute : public Attribute {
    public:
        shared_ptr<Node> rootNode;

        EditableAttribute(std::string name, shared_ptr<Node> rootNode, weak_ptr<Organism> organism) : Attribute(name, organism) {
            this->rootNode = rootNode;
        }

        AttributeOutput eval(const EvalContext& evalContext) override {
            AttributeOutput output;
            float value = this->rootNode->eval(evalContext);
            output.value = value;
            output.name = this->name;
            return output;
        }
};

class CloneNumberAttribute : public Attribute {
    public:
        CloneNumberAttribute(weak_ptr<Organism> organism) : Attribute("cloneNumber", organism) {}

        AttributeOutput eval(const EvalContext& evalContext) {
            AttributeOutput output;
            output.name = this->name;
            output.value = evalContext.organismEvalContextByOrganism.at(this->organism)->currentCloneNumber;
            return output;
        }
};


class AttributeReferenceNode : public Node {
    public:
        weak_ptr<Attribute> attribute;
        AttributeReferenceNode(weak_ptr<Attribute> attribute) { this->attribute = attribute; }

        float eval(const EvalContext& evalContext) {
            return attribute.lock()->eval(evalContext).value;
        }
};


class Organism {
    public:
        static shared_ptr<OrganismOutput> eval(shared_ptr<Organism> organism, EvalContext* evalContext) {
            auto organismOutput = std::make_shared<OrganismOutput>();
            auto organismEvalContext = std::make_shared<OrganismEvalContext>();
            evalContext->organismEvalContextByOrganism.emplace(weak_ptr<Organism>(organism), organismEvalContext);

            float cloneCount = organism->cloneCountAttribute.lock()->eval(*evalContext).value;
            for (int cloneNumber = 0; cloneNumber < cloneCount; cloneNumber++) {
                organismEvalContext->currentCloneNumber = cloneNumber;
                OrganismCloneOutput cloneOutput;
                for (const auto &attribute : organism->attributes) {
                    cloneOutput.attributes.emplace_back(attribute->eval(*evalContext));
                }
                organismOutput->cloneOutputByCloneNumber.emplace_back(std::move(cloneOutput));
            }
            return organismOutput;
        }

        vector<shared_ptr<Attribute>> attributes;
        vector<shared_ptr<Organism>> suborganisms;
        weak_ptr<Attribute> cloneCountAttribute;
};


class ExpressorTree {
    public:
        EvalOutput* eval() {
            auto evalOutput = new EvalOutput();
            EvalContext evalContext;
            evalOutput->rootOrganism = Organism::eval(this->rootOrganism, &evalContext);
            return evalOutput;
        }

        static EvalOutput* test() {
            ExpressorTree tree;
            tree.rootOrganism = std::make_shared<Organism>();
            auto rootOrganism = tree.rootOrganism;
            auto addNode = std::make_shared<AddOpNode>(std::make_shared<NumberNode>(0), std::make_shared<NumberNode>(500));
            tree.rootOrganism->attributes.emplace_back(
                std::make_shared<EditableAttribute>(
                    EditableAttribute("x", addNode, weak_ptr<Organism>(rootOrganism))));

            EditableAttribute cloneCountAttribute = EditableAttribute("clones", std::make_unique<NumberNode>(3), weak_ptr<Organism>(rootOrganism));
            tree.rootOrganism->attributes.emplace_back(std::make_shared<EditableAttribute>(cloneCountAttribute));
            tree.rootOrganism->cloneCountAttribute = weak_ptr<Attribute>(tree.rootOrganism->attributes.back());

            tree.rootOrganism->attributes.emplace_back(
                std::make_shared<CloneNumberAttribute>(
                    CloneNumberAttribute(weak_ptr<Organism>(rootOrganism))));

            const auto attributePtr = weak_ptr<Attribute>(tree.rootOrganism->attributes.back());
            EditableAttribute yAttribute = EditableAttribute("y", std::make_unique<AttributeReferenceNode>(attributePtr), weak_ptr<Organism>(rootOrganism));
            tree.rootOrganism->attributes.emplace_back(std::make_shared<EditableAttribute>(yAttribute));

            return tree.eval();
        }

        static void hi() {
            printf("hi\n");
        }

    private:
        int clones;
        shared_ptr<Organism> rootOrganism;
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