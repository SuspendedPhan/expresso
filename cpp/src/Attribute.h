#ifndef EXPRESSO_ATTRIBUTE_H
#define EXPRESSO_ATTRIBUTE_H

#include <map>
#include <utility>
#include <vector>
#include <string>

#include "EvalOutput.h"
#include "EvalContext.h"
#include "Node.h"
#include "Code.h"
#include "Signal.h"

class Organism;

class Node;

class Attribute {
public:
    std::string name;
    std::string id = Code::generateUuidV4();
    Organism* organism;

    Attribute(std::string name, Organism* organism) {
        this->name = std::move(name);
        this->organism = organism;
    }

    Attribute(std::string name, Organism* organism, std::string id) : name(std::move(name)), organism(organism), id(std::move(id)) {}

    std::string getName() const { return this->name; }
    std::string getId() const { return this->id; }

    virtual AttributeOutput eval(const EvalContext &evalContext) const = 0;
    virtual bool getIsCloneNumberAttribute() { return false; }
    virtual bool getIsEditableAttribute() { return false; }
    virtual bool getIsIntrinsicAttribute() { return false; }

    virtual ~Attribute() = default;
};

class EditableAttribute : public Attribute {
private:
    std::unique_ptr<Node> rootNode;
    Signal onChangedSignal;
public:
    EditableAttribute(std::string name, Organism* organism) : Attribute(
            std::move(name), organism) {}

    EditableAttribute(std::string name, Organism* organism, const std::string& id) : Attribute(
            std::move(name), organism, id) {}

    Signal* getOnChangedSignal();

    AttributeOutput eval(const EvalContext &evalContext) const override;
    bool getIsEditableAttribute() override { return true; }

    void setRootNode(std::unique_ptr<Node> rootNode);

    Node *getRootNode();
};

class CloneNumberAttribute : public Attribute {
public:
    explicit CloneNumberAttribute(Organism* organism) : Attribute("cloneNumber", organism) {}
    CloneNumberAttribute(Organism* organism, const std::string& id) : Attribute("cloneNumber", organism, id) {}

    bool getIsCloneNumberAttribute() override { return true; }

    AttributeOutput eval(const EvalContext &evalContext) const override {
        AttributeOutput output;
        output.name = this->name;
        output.value = (float) evalContext.organismEvalContextByOrganism.at(this->organism)->currentCloneNumber;
        return output;
    }
};

class IntrinsicAttribute : public Attribute {
public:
    IntrinsicAttribute(const std::string &name, Organism* organism) : Attribute(name, organism) {}
    IntrinsicAttribute(const std::string &name, Organism* organism, const std::string& id) : Attribute(name, organism, id) {}

    bool getIsIntrinsicAttribute() override { return true; }

    AttributeOutput eval(const EvalContext &evalContext) const override;
};


#endif //EXPRESSO_ATTRIBUTE_H
