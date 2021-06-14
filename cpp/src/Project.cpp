//
// Created by Dylan on 6/4/2021.
//

#include "Project.h"

#include <utility>

EvalOutput* Project::evalOrganismTree() {
    EvalContext evalContext;
    auto* evalOutput = new EvalOutput();
    evalOutput->rootOrganism = std::make_shared<OrganismOutput>(this->getRootOrganism()->eval(&evalContext));
    return evalOutput;
}

Organism *Project::getRootOrganism() {
    return this->rootOrganism.get();
}

const std::string &Project::getId() const {
    return id;
}

void Project::setRootOrganism(std::shared_ptr<Organism> rootOrganism) {
    this->rootOrganism = std::move(rootOrganism);
}

std::shared_ptr<Organism> Project::makeRootOrganism() {
    return Organism::make("the void");
}
