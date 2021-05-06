#ifndef EXPRESSO_ORGANISM_H
#define EXPRESSO_ORGANISM_H

#include "Attribute.h"

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

    static std::shared_ptr<OrganismOutput> eval(const shared_ptr<Organism> &organism, EvalContext *evalContext) {
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

    void addSuborganism() {
        this->suborganisms.emplace_back(std::make_shared<Organism>());
    }

    vector<shared_ptr<Attribute>> attributes;
    vector<shared_ptr<Organism>> suborganisms;
    weak_ptr<EditableAttribute> cloneCountAttribute;
    weak_ptr<Attribute> cloneNumberAttribute;
};

#endif //EXPRESSO_ORGANISM_H
