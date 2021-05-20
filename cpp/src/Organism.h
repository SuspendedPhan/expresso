#ifndef EXPRESSO_ORGANISM_H
#define EXPRESSO_ORGANISM_H

#include "Attribute.h"
#include "Code.h"
#include <cassert>

class Organism : public std::enable_shared_from_this<Organism> {
private:
    std::string name;
    std::string id = Code::generateUuidV4();

    Organism(std::string name) : name(name) {}

public:
    vector<shared_ptr<Attribute>> attributes;
    vector<shared_ptr<Organism>> suborganisms;
    weak_ptr<EditableAttribute> cloneCountAttribute;
    weak_ptr<Attribute> cloneNumberAttribute;
    weak_ptr<Organism> superorganism;

    static std::shared_ptr<Organism> make(std::string name) {
        auto organism = std::shared_ptr<Organism>(new Organism(name));

        const shared_ptr<EditableAttribute> &cloneCountAttribute = std::make_shared<EditableAttribute>("clones", organism);
        cloneCountAttribute->setRootNode(std::make_unique<NumberNode>(1.0f));
        organism->cloneCountAttribute = cloneCountAttribute;
        organism->attributes.push_back(cloneCountAttribute);

        const shared_ptr<CloneNumberAttribute> &cloneNumberAttribute = std::make_shared<CloneNumberAttribute>(organism);
        organism->cloneNumberAttribute = cloneNumberAttribute;
        organism->attributes.push_back(cloneNumberAttribute);

        return organism;
    }

    OrganismOutput eval(EvalContext *evalContext) {
        const auto &shared_this = shared_from_this();

        OrganismOutput organismOutput;
        auto organismEvalContext = std::make_shared<OrganismEvalContext>();
        evalContext->organismEvalContextByOrganism.emplace(weak_ptr<Organism>(shared_this), organismEvalContext);

        float cloneCount = shared_this->cloneCountAttribute.lock()->eval(*evalContext).value;
        for (int cloneNumber = 0; cloneNumber < cloneCount; cloneNumber++) {
            organismEvalContext->currentCloneNumber = cloneNumber;
            OrganismCloneOutput cloneOutput;
            for (const auto &attribute : shared_this->attributes) {
                cloneOutput.attributes.emplace_back(attribute->eval(*evalContext));
            }
            for (const auto &suborganism : shared_this->suborganisms) {
                cloneOutput.suborganisms.emplace_back(suborganism->eval(evalContext));
            }
            organismOutput.cloneOutputByCloneNumber.emplace_back(std::move(cloneOutput));
        }
        return organismOutput;
    }

    void addSuborganism(std::string name) {
        const shared_ptr<Organism> &suborganism = Organism::make(name);
        const shared_ptr<Organism> &shared_this = shared_from_this();
        suborganism->superorganism = shared_this;
        shared_this->suborganisms.emplace_back(suborganism);
    }
    
    void remove() {
        const auto &organism = shared_from_this();
        assert(!organism->superorganism.expired());
        Code::vecremove(organism->superorganism.lock()->suborganisms, organism);
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
