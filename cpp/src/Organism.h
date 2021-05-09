#ifndef EXPRESSO_ORGANISM_H
#define EXPRESSO_ORGANISM_H

#include "Attribute.h"
#include "Code.h"
#include <cassert>

class Organism {
private:
    Organism() {}

public:
    static std::shared_ptr<Organism> make() {
        auto organism = std::shared_ptr<Organism>(new Organism());
        const shared_ptr<EditableAttribute> &cloneCountAttribute = std::make_shared<EditableAttribute>("clones",
                std::make_unique<NumberNode>(1.0f),
                organism);
        organism->cloneCountAttribute = cloneCountAttribute;
        organism->attributes.push_back(cloneCountAttribute);

        const shared_ptr<CloneNumberAttribute> &cloneNumberAttribute = std::make_shared<CloneNumberAttribute>(organism);
        organism->cloneNumberAttribute = cloneNumberAttribute;
        organism->attributes.push_back(cloneNumberAttribute);

        return organism;
    }

    static OrganismOutput eval(const shared_ptr<Organism> &organism, EvalContext *evalContext) {
        OrganismOutput organismOutput;
        auto organismEvalContext = std::make_shared<OrganismEvalContext>();
        evalContext->organismEvalContextByOrganism.emplace(weak_ptr<Organism>(organism), organismEvalContext);

        float cloneCount = organism->cloneCountAttribute.lock()->eval(*evalContext).value;
        for (int cloneNumber = 0; cloneNumber < cloneCount; cloneNumber++) {
            organismEvalContext->currentCloneNumber = cloneNumber;
            OrganismCloneOutput cloneOutput;
            for (const auto &attribute : organism->attributes) {
                cloneOutput.attributes.emplace_back(attribute->eval(*evalContext));
            }
            for (const auto &suborganism : organism->suborganisms) {
                cloneOutput.suborganisms.emplace_back(Organism::eval(suborganism, evalContext));
            }
            organismOutput.cloneOutputByCloneNumber.emplace_back(std::move(cloneOutput));
        }
        return organismOutput;
    }

    static void addSuborganism(const shared_ptr<Organism> organism) {
        const shared_ptr<Organism> &suborganism = Organism::make();
        suborganism->superorganism = organism;
        organism->suborganisms.emplace_back(suborganism);
    }
    
    static void remove(const shared_ptr<Organism> organism) {
        assert(!organism->superorganism.expired());
        Code::vecremove(organism->superorganism.lock()->suborganisms, organism);
    }

    vector<shared_ptr<Attribute>> attributes;
    vector<shared_ptr<Organism>> suborganisms;
    weak_ptr<EditableAttribute> cloneCountAttribute;
    weak_ptr<Attribute> cloneNumberAttribute;
    weak_ptr<Organism> superorganism;
};

#endif //EXPRESSO_ORGANISM_H
