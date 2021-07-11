#ifndef EXPRESSO_EVALCONTEXT_H
#define EXPRESSO_EVALCONTEXT_H

#include <map>
#include "FunctionParameter.h"

class Organism;

class IntrinsicAttribute;
class OrganismOutput;

class OrganismEvalContext {
public:
    OrganismOutput *organismOutput;

    explicit OrganismEvalContext(OrganismOutput *organismOutput) : organismOutput(organismOutput) {}

    int currentCloneNumber = 0;
};


class EvalContext {
public:
    std::map<Organism *, OrganismEvalContext *> organismEvalContextByOrganism;
    std::map<const IntrinsicAttribute *, float> _valueByIntrinsicAttribute;

    void setValue(const IntrinsicAttribute * attribute, float value);
};

class NodeEvalContext {
public:
    std::map<const FunctionParameter *, float> valueByParameter;
};

#endif //EXPRESSO_EVALCONTEXT_H
