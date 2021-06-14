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
    std::vector<std::shared_ptr<Function>> functions;
    std::shared_ptr<Organism> rootOrganism;
    std::string id;
public:
    Project() : id(Code::generateUuidV4()) {}
    explicit Project(std::string id) : id(std::move(id)) {}

    static unique_ptr<Organism> makeRootOrganism();

    const std::string &getId() const;
    EvalOutput * evalOrganismTree();
    Organism* getRootOrganism();
    void setRootOrganism(std::unique_ptr<Organism> rootOrganism);
};


#endif //EXPRESSO_PROJECT_H
