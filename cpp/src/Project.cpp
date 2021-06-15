//
// Created by Dylan on 6/4/2021.
//

#include "Project.h"

#include <utility>

unique_ptr<EvalOutput> Project::evalOrganismTree() const {
    EvalContext evalContext;
    auto evalOutput = std::make_unique<EvalOutput>();
    evalOutput->rootOrganism = this->getRootOrganism()->eval(&evalContext);
    return std::move(evalOutput);
}

Organism *Project::getRootOrganism() const {
    return this->rootOrganism.get();
}

const std::string &Project::getId() const {
    return id;
}

std::unique_ptr<Organism> Project::makeRootOrganism() {
    return Organism::makeWithStandardAttributes("the void");
}
