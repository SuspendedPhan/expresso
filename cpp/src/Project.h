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
    std::shared_ptr<Organism> rootOrganism = Organism::make("the void");
    std::string id = Code::generateUuidV4();
public:
    const std::string &getId() const;

public:
    EvalOutput * evalOrganismTree();
    Organism* getRootOrganism();
};


#endif //EXPRESSO_PROJECT_H
