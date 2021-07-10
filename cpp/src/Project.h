//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_PROJECT_H
#define EXPRESSO_PROJECT_H


#include <vector>
#include <memory>
#include "Function.h"
#include "Organism.h"

class Project {
private:
    std::string id;
    std::unique_ptr<Organism> rootOrganism;
    Signal _onFunctionsChangedSignal;
    std::vector<std::unique_ptr<Function>> _functions;
public:
    explicit Project(unique_ptr<Organism> rootOrganism) : id(Code::generateUuidV4()) {
        this->setRootOrganism(std::move(rootOrganism));
    }

    Project(unique_ptr<Organism> rootOrganism, std::string id) :
            id(std::move(id)) {
        this->setRootOrganism(std::move(rootOrganism));
    }

    static unique_ptr<Organism> makeRootOrganism();
    const std::string &getId() const;
    unique_ptr<EvalOutput> evalOrganismTree(unique_ptr<EvalContext> evalContext) const;
    Organism* getRootOrganism() const;
    Signal * getOnFunctionsChangedSignal();
    std::vector<Function *> getFunctions();
    void addFunction(std::unique_ptr<Function> function);

    /**
     * This NEEDS to be called after dead attributes are added.
     */
    void setRootOrganism(std::unique_ptr<Organism> organism);
    static void addRootAttributes(Organism *organism);
};


#endif //EXPRESSO_PROJECT_H
