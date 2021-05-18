#ifndef EXPRESSO_ATTRIBUTE_H
#define EXPRESSO_ATTRIBUTE_H

#include <map>
#include <vector>
#include <string>

#include "EvalOutput.h"
#include "EvalContext.h"
#include "Node.h"
#include "Code.h"
#include "Signal.h"

class Organism;

class Node;

class Attribute : public std::enable_shared_from_this<Attribute> {
public:
    std::string name;
    std::string id = Code::generateUuidV4();
    std::weak_ptr<Organism> organism;

    Attribute(std::string name, std::weak_ptr<Organism> organism) {
        this->name = name;
        this->organism = organism;
    }

    std::string getName() { return this->name; }
    std::string getId() { return this->id; }

    virtual AttributeOutput eval(const EvalContext &evalContext) const = 0;

    virtual ~Attribute() {}
};

class EditableAttribute : public Attribute {
private:
    std::shared_ptr<Node> rootNode;
    Signal onChangedSignal;
public:
    Signal* getOnChangedSignal();

public:

    EditableAttribute(std::string name, std::shared_ptr<Node> rootNode, std::weak_ptr<Organism> organism) : Attribute(
            name, organism) {
        this->setRootNode(rootNode);
    }

    AttributeOutput eval(const EvalContext &evalContext) const override;

    void setRootNode(const std::shared_ptr<Node> &rootNode);

    Node *getRootNode();
};

class CloneNumberAttribute : public Attribute {
public:
    CloneNumberAttribute(std::weak_ptr<Organism> organism) : Attribute("cloneNumber", organism) {}

    AttributeOutput eval(const EvalContext &evalContext) const override {
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
