#ifndef EXPRESSO_EVALOUTPUT_H
#define EXPRESSO_EVALOUTPUT_H
#include <vector>
#include "Code.h"

class OrganismOutput;

class AttributeOutput {
    public:
        float value = 0;
        std::string name;

        float getValue() const {
            return this->value;
        }

        std::string getName() const {
            return this->name;
        }
};

class OrganismCloneOutput {
    public:
        std::vector<std::unique_ptr<AttributeOutput>> attributes;
        std::vector<std::unique_ptr<OrganismOutput>> suborganisms;

        std::vector<AttributeOutput*> getAttributes() const {
            return Code::map<std::unique_ptr<AttributeOutput>, AttributeOutput*>(this->attributes, [&](const auto & attribute) { return attribute.get(); });
        }

        std::vector<OrganismOutput*> getSuborganisms() const {
            return Code::map<std::unique_ptr<OrganismOutput>, OrganismOutput*>(this->suborganisms, [&](const auto & suborganism) { return suborganism.get(); });
        }
};


class OrganismOutput {
    public:
        std::vector<std::unique_ptr<OrganismCloneOutput>> cloneOutputByCloneNumber;
        std::vector<OrganismCloneOutput*> getCloneOutputByCloneNumber() const {
            return Code::map<std::unique_ptr<OrganismCloneOutput>, OrganismCloneOutput*>(this->cloneOutputByCloneNumber, [&](const auto & output) { return output.get(); });
        }
};


class EvalOutput {
    public:
        OrganismOutput rootOrganism;
        const OrganismOutput* getRootOrganism() const {
            return &this->rootOrganism;
        }
};

#endif //EXPRESSO_EVALOUTPUT_H
