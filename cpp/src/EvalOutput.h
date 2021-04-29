#ifndef EXPRESSO_EVALOUTPUT_H
#define EXPRESSO_EVALOUTPUT_H
#include <vector>

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
        std::vector<AttributeOutput> attributes;
        std::vector<OrganismOutput> suborganisms;

        std::vector<AttributeOutput> getAttributes() {
            return this->attributes;
        }

        std::vector<OrganismOutput> getSuborganisms() {
            return this->suborganisms;
        }
};


class OrganismOutput {
    public:
        std::vector<OrganismCloneOutput> cloneOutputByCloneNumber;
        std::vector<OrganismCloneOutput> getCloneOutputByCloneNumber() {
            return this->cloneOutputByCloneNumber;
        }
};


class EvalOutput {
    public:
        std::shared_ptr<OrganismOutput> rootOrganism;
        OrganismOutput* getRootOrganism() {
            return this->rootOrganism.get();
        }
};

#endif //EXPRESSO_EVALOUTPUT_H
