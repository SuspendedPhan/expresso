//
// Created by Dylan on 6/4/2021.
//

#include "Project.h"

#include <utility>

unique_ptr<EvalOutput> Project::evalOrganismTree(std::unique_ptr<EvalContext> evalContext) const {
    auto evalOutput = std::make_unique<EvalOutput>();
    evalOutput->rootOrganism = std::make_unique<OrganismOutput>(this->getRootOrganism()->eval(evalContext.get()));
    return std::move(evalOutput);
}

Organism *Project::getRootOrganism() const {
    return this->rootOrganism.get();
}

const std::string &Project::getId() const {
    return id;
}

std::unique_ptr<Organism> Project::makeRootOrganism() {
    unique_ptr<Organism> organism = Organism::makeWithStandardAttributes("the void");
    addRootAttributes(organism.get());
    return std::move(organism);
}

void Project::addRootAttributes(Organism *organism) {
    bool hasTimeAttribute = false;
    for (const auto attribute : organism->getAttributes()) {
        if (attribute->getName() == "time") {
            hasTimeAttribute = true;
        }
    }
    if (!hasTimeAttribute) {
        auto timeAttribute = std::make_unique<IntrinsicAttribute>("time", organism);
        organism->addAttribute(std::move(timeAttribute));
    }
}

Signal * Project::getOnFunctionsChangedSignal() {
    return &this->_onFunctionsChangedSignal;
}

std::vector<Function *> Project::getFunctions() {
    std::vector<Function *> functions;
    for (const auto &fun : this->_functions) {
        functions.emplace_back(fun.get());
    }
    return functions;
}

void Project::setRootOrganism(std::unique_ptr<Organism> organism) {
    organism->setProject(this);
    addRootAttributes(organism.get());
    this->rootOrganism = std::move(organism);
}

void Project::addFunction(std::unique_ptr<Function> function) {
    function->setProject(this);
    _functions.push_back(std::move(function));
    _onFunctionsChangedSignal.dispatch();
}
