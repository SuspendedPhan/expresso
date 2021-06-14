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

    Attribute(std::string name, std::weak_ptr<Organism> organism, std::string id) : name(name), organism(organism), id(id) {}

    std::string getName() { return this->name; }
    std::string getId() { return this->id; }

    virtual AttributeOutput eval(const EvalContext &evalContext) const = 0;
    virtual bool getIsCloneNumberAttribute() { return false; }
    virtual bool getIsEditableAttribute() { return false; }
    virtual bool getIsIntrinsicAttribute() { return false; }

    virtual ~Attribute() {}
};

class EditableAttribute : public Attribute {
private:
    std::shared_ptr<Node> rootNode;
    Signal onChangedSignal;
public:
    EditableAttribute(std::string name, std::weak_ptr<Organism> organism) : Attribute(
            name, organism) {}

    EditableAttribute(std::string name, std::weak_ptr<Organism> organism, const std::string& id) : Attribute(
            name, organism, id) {}

    Signal* getOnChangedSignal();

    AttributeOutput eval(const EvalContext &evalContext) const override;
    bool getIsEditableAttribute() override { return true; }

    void setRootNode(const std::shared_ptr<Node> &rootNode);

    Node *getRootNode();
};

class CloneNumberAttribute : public Attribute {
public:
    CloneNumberAttribute(std::weak_ptr<Organism> organism) : Attribute("cloneNumber", organism) {}
    CloneNumberAttribute(std::weak_ptr<Organism> organism, const std::string& id) : Attribute("cloneNumber", organism, id) {}

    bool getIsCloneNumberAttribute() override { return true; }

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
    IntrinsicAttribute(const std::string &name, const std::weak_ptr<Organism> &organism, const std::string& id);

    bool getIsIntrinsicAttribute() override { return true; }

    AttributeOutput eval(const EvalContext &evalContext) const override;
};


#endif //EXPRESSO_ATTRIBUTE_H
