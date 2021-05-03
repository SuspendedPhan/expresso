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

class Attribute : public std::enable_shared_from_this<Attribute> {
    public:
        std::string name;
        std::weak_ptr<Organism> organism;

        Attribute(std::string name, std::weak_ptr<Organism> organism) {
            this->name = name;
            this->organism = organism;
        }

        virtual AttributeOutput eval(const EvalContext& evalContext) const = 0;
        virtual ~Attribute() {}
};

class EditableAttribute : public Attribute {
public:
    std::shared_ptr<Node> rootNode;

    EditableAttribute(std::string name, std::shared_ptr<Node> rootNode, std::weak_ptr<Organism> organism) : Attribute(name, organism) {
        this->rootNode = rootNode;
    }

    AttributeOutput eval(const EvalContext& evalContext) const override;
};

class CloneNumberAttribute : public Attribute {
    public:
        CloneNumberAttribute(std::weak_ptr<Organism> organism) : Attribute("cloneNumber", organism) {}

        AttributeOutput eval(const EvalContext& evalContext) const {
            AttributeOutput output;
            output.name = this->name;
            output.value = evalContext.organismEvalContextByOrganism.at(this->organism)->currentCloneNumber;
            return output;
        }
};

class IntrinsicAttribute : public Attribute {
public:
    IntrinsicAttribute(const std::string &name, const std::weak_ptr<Organism> &organism);

    AttributeOutput eval(const EvalContext &evalContext) const override;
};


#endif //EXPRESSO_ATTRIBUTE_H
