#ifndef EXPRESSO_EVALCONTEXT_H
#define EXPRESSO_EVALCONTEXT_H

#include <map>

class Organism;
class IntrinsicAttribute;

class OrganismEvalContext {
public:
    OrganismOutput* organismOutput;

    explicit OrganismEvalContext(OrganismOutput *organismOutput) : organismOutput(organismOutput) {}

    int currentCloneNumber = 0;
};


class EvalContext {
public:
    std::map<Organism*, std::unique_ptr<OrganismEvalContext>> organismEvalContextByOrganism;
    std::map<Organism*, OrganismEvalContext*> acc;
    std::map<const IntrinsicAttribute*, float> valueByIntrinsicAttribute;
};

#endif //EXPRESSO_EVALCONTEXT_H
