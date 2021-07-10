#ifndef EXPRESSO_EVALCONTEXT_H
#define EXPRESSO_EVALCONTEXT_H

#include <map>
#include "FunctionParameter.h"

class Organism;

class IntrinsicAttribute;

class OrganismEvalContext {
public:
    OrganismOutput *organismOutput;

    explicit OrganismEvalContext(OrganismOutput *organismOutput) : organismOutput(organismOutput) {}

    int currentCloneNumber = 0;
};


class EvalContext {
public:
    std::map<Organism *, OrganismEvalContext *> organismEvalContextByOrganism;
    std::map<const IntrinsicAttribute *, float> valueByIntrinsicAttribute;

    const std::map<const IntrinsicAttribute *, float> &getValueByIntrinsicAttributeMap() const {
        return valueByIntrinsicAttribute;
    }
};

class NodeEvalContext {
public:
    std::map<const FunctionParameter *, float> valueByParameter;
};

#endif //EXPRESSO_EVALCONTEXT_H
