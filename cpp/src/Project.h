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
public:
    std::unique_ptr<Organism> rootOrganism;
    std::string id;

    explicit Project(unique_ptr<Organism> rootOrganism) : id(Code::generateUuidV4()), rootOrganism(
            std::move(rootOrganism)) {}

    Project(unique_ptr<Organism> rootOrganism, std::string id) : rootOrganism(std::move(rootOrganism)),
            id(std::move(id)) {}


    static unique_ptr<Organism> makeRootOrganism();

    const std::string &getId() const;
    std::unique_ptr<EvalOutput> evalOrganismTree() const;
    Organism* getRootOrganism() const;
};


#endif //EXPRESSO_PROJECT_H
