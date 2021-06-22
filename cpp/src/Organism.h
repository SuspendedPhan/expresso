#ifndef EXPRESSO_ORGANISM_H
#define EXPRESSO_ORGANISM_H

#include "Attribute.h"
#include "Code.h"
#include <cassert>
#include <memory>
#include <utility>

class Organism {
private:
    std::string name;
    std::string id;

public:
    vector<std::unique_ptr<Attribute>> attributes;
    vector<std::unique_ptr<Organism>> suborganisms;
    EditableAttribute* cloneCountAttribute = nullptr;
    Attribute* cloneNumberAttribute = nullptr;
    Organism* superorganism = nullptr;

    explicit Organism(std::string name) : name(std::move(name)), id(Code::generateUuidV4()) {}
    Organism(std::string name, std::string id) : name(std::move(name)), id(std::move(id)) {}

    static std::unique_ptr<Organism> makeWithStandardAttributes(std::string name, const std::string& id = Code::generateUuidV4()) {
        auto organism = std::make_unique<Organism>(std::move(name), id);

        std::unique_ptr<EditableAttribute> cloneCountAttribute = std::make_unique<EditableAttribute>("clones", organism.get(), std::make_unique<NumberNode>(1.0f));
        organism->cloneCountAttribute = cloneCountAttribute.get();
        organism->attributes.emplace_back(std::move(cloneCountAttribute));

        std::unique_ptr<CloneNumberAttribute> cloneNumberAttribute = std::make_unique<CloneNumberAttribute>(organism.get());
        organism->cloneNumberAttribute = cloneNumberAttribute.get();
        organism->attributes.emplace_back(std::move(cloneNumberAttribute));

        std::unique_ptr<EditableAttribute> xAttribute = std::make_unique<EditableAttribute>("x", organism.get(), std::make_unique<NumberNode>(0.0f));
        organism->attributes.emplace_back(std::move(xAttribute));
        std::unique_ptr<EditableAttribute> yAttribute = std::make_unique<EditableAttribute>("y", organism.get(), std::make_unique<NumberNode>(0.0f));
        organism->attributes.emplace_back(std::move(yAttribute));

        return organism;
    }

    OrganismOutput eval(EvalContext *evalContext) {
        OrganismOutput organismOutput;
        OrganismEvalContext organismEvalContext(&organismOutput);
        evalContext->organismEvalContextByOrganism.emplace(this, &organismEvalContext);

        float cloneCount = this->cloneCountAttribute->eval(*evalContext).value;
        for (int cloneNumber = 0; cloneNumber < (int) cloneCount; cloneNumber++) {
            organismEvalContext.currentCloneNumber = cloneNumber;
            auto cloneOutput = std::make_unique<OrganismCloneOutput>();
            for (const auto &attribute : this->getAttributes()) {
                auto attributeOutput = std::make_unique<AttributeOutput>(attribute->eval(*evalContext));
                cloneOutput->attributes.emplace_back(std::move(attributeOutput));
            }
            for (const auto &suborganism : this->suborganisms) {
                cloneOutput->suborganisms.emplace_back(std::make_unique<OrganismOutput>(suborganism->eval(evalContext)));
            }
            organismOutput.cloneOutputByCloneNumber.emplace_back(std::move(cloneOutput));
        }
        evalContext->organismEvalContextByOrganism.erase(this);
        return organismOutput;
    }

    void addSuborganism(std::unique_ptr<Organism> suborganism) {
        suborganism->superorganism = this;
        this->suborganisms.emplace_back(std::move(suborganism));
    }

    void addAttribute(std::unique_ptr<Attribute> attribute) {
        attribute->organism = this;
        if (attribute->name == "clones") {
            this->cloneCountAttribute = dynamic_cast<EditableAttribute*>(attribute.get());
        } else if (auto* cloneNumberAttribute = dynamic_cast<CloneNumberAttribute*>(attribute.get())) {
            this->cloneNumberAttribute = cloneNumberAttribute;
        }
        this->attributes.push_back(std::move(attribute));
    }
    
    void remove() {
        auto superorganism = this->superorganism;
        Code::remove<Organism>(superorganism->suborganisms, [&](const auto &organism) { return organism.get() == this; });
    }

    std::vector<Organism*> getSuborganisms() {
        std::vector<Organism*> suborganisms;
        for (const auto &suborganism : this->suborganisms) {
            suborganisms.emplace_back(suborganism.get());
        }
        return suborganisms;
    }

    std::vector<Attribute*> getAttributes() {
        std::vector<Attribute*> attributes;
        for (const auto &attribute : this->attributes) {
            attributes.emplace_back(attribute.get());
        }
        return attributes;
    }

    std::string getName() {
        return this->name;
    }

    std::string getId() {
        return this->id;
    }
};

#endif //EXPRESSO_ORGANISM_H
