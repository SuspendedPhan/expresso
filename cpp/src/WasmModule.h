//
// Created by Dylan on 4/27/2021.
//

#ifndef EXPRESSO_WASMMODULE_H
#define EXPRESSO_WASMMODULE_H

#include "EvalOutput.h"
#include "EvalContext.h"
#include "Organism.h"

class ExpressorTree {
    public:
        EvalOutput* eval() {
            auto evalOutput = new EvalOutput();
            EvalContext evalContext;
            evalOutput->rootOrganism = Organism::eval(this->rootOrganism, &evalContext);
            return evalOutput;
        }

        static EvalOutput* test();

        static void hi() {
            printf("hi\n");
        }

    private:
        int clones;
        std::shared_ptr<Organism> rootOrganism;
};

#endif //EXPRESSO_WASMMODULE_H
