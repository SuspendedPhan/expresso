//
// Created by Dylan on 6/4/2021.
//

#include "Project.h"

#include <utility>

unique_ptr<EvalOutput> Project::evalOrganismTree() const {
    EvalContext evalContext;
    auto evalOutput = std::make_unique<EvalOutput>();
    evalOutput->rootOrganism = std::make_unique<OrganismOutput>(this->getRootOrganism()->eval(&evalContext));
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

Signal * Project::getOnFunctionsChangedSignal() {
    return &this->onFunctionsChangedSignal;
}

std::vector<Function *> Project::getFunctions() {
    std::vector<Function *> functions;
    for (const auto &fun : this->functions) {
        functions.emplace_back(fun.get());
    }
    return functions;
}

void Project::addFunction(std::unique_ptr<Function> function) {
    this->functions.push_back(std::move(function));
}
