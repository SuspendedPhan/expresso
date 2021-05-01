#ifndef EXPRESSO_ATTRIBUTE_H
#define EXPRESSO_ATTRIBUTE_H

#include <map>
#include <vector>
#include <string>

#include "EvalOutput.h"
#include "EvalContext.h"
#include "Node.h"

class Organism;
class Node;

class Attribute {
    public:
        std::string name;
        std::weak_ptr<Organism> organism;

        Attribute(std::string name, std::weak_ptr<Organism> organism) {
            this->name = name;
            this->organism = organism;
        }

        virtual AttributeOutput eval(const EvalContext& evalContext) = 0;
        virtual ~Attribute() {}
};

class Attribute2 {
public:
    virtual void eval() = 0;
    virtual ~Attribute2() = default;
};


class EditableAttribute2 : public Attribute2 {
    public:
        void eval() override;
        virtual ~EditableAttribute2() = default;
};

class EditableAttribute : public Attribute {
public:
    std::shared_ptr<Node> rootNode;

    EditableAttribute(std::string name, std::shared_ptr<Node> rootNode, std::weak_ptr<Organism> organism) : Attribute(name, organism) {
        this->rootNode = rootNode;
    }

    AttributeOutput eval(const EvalContext& evalContext) override;
};

class CloneNumberAttribute : public Attribute {
    public:
        CloneNumberAttribute(std::weak_ptr<Organism> organism) : Attribute("cloneNumber", organism) {}

        AttributeOutput eval(const EvalContext& evalContext) {
            AttributeOutput output;
            output.name = this->name;
            output.value = evalContext.organismEvalContextByOrganism.at(this->organism)->currentCloneNumber;
            return output;
        }
};


#endif //EXPRESSO_ATTRIBUTE_H
