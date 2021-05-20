//
// Created by Dylan on 4/27/2021.
//

#ifndef EXPRESSO_WASMMODULE_H
#define EXPRESSO_WASMMODULE_H

#include <chrono>
#include "EvalOutput.h"
#include "EvalContext.h"
#include "Organism.h"

class ExpressorTree {
public:
    std::shared_ptr<Organism> rootOrganism = Organism::make("root");
    std::shared_ptr<IntrinsicAttribute> timeAttribute;
    std::chrono::time_point<std::chrono::system_clock> epoch = std::chrono::system_clock::now();

    ExpressorTree() {
        this->timeAttribute = std::make_shared<IntrinsicAttribute>("time", rootOrganism);
        this->rootOrganism->attributes.emplace_back(this->timeAttribute);
    }

    static void populateTestTree(ExpressorTree &tree);
    static void populateTestTree2(ExpressorTree &tree);

    EvalOutput *eval() {
        auto evalOutput = new EvalOutput();
        EvalContext evalContext;
        const auto elapsed = std::chrono::system_clock::now() - this->epoch;
        const auto elapsedFloat = std::chrono::duration_cast<std::chrono::duration<float>>(elapsed);
        const float elapsedSeconds = elapsedFloat.count();

        evalContext.valueByIntrinsicAttribute[this->timeAttribute] = elapsedSeconds;
        evalOutput->rootOrganism = std::make_shared<OrganismOutput>(this->rootOrganism->eval(&evalContext));
        return evalOutput;
    }

    Organism* getRootOrganism() {
        return this->rootOrganism.get();
    }
};

#endif //EXPRESSO_WASMMODULE_H
