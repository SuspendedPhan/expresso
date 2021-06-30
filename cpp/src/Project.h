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
    Signal onFunctionsChangedSignal;
    std::vector<std::unique_ptr<Function>> functions;
public:
    explicit Project(unique_ptr<Organism> rootOrganism) : id(Code::generateUuidV4()), rootOrganism(
            std::move(rootOrganism)) {}

    Project(unique_ptr<Organism> rootOrganism, std::string id) : rootOrganism(std::move(rootOrganism)),
            id(std::move(id)) {}

    static unique_ptr<Organism> makeRootOrganism();


    const std::string &getId() const;

    std::unique_ptr<EvalOutput> evalOrganismTree() const;
    Organism* getRootOrganism() const;
    Signal * getOnFunctionsChangedSignal();
    std::vector<Function *> getFunctions();

    void setRootOrganism(std::unique_ptr<Organism> organism) { this->rootOrganism = std::move(organism); }

    void addFunction(std::unique_ptr<Function> function);
};


#endif //EXPRESSO_PROJECT_H
