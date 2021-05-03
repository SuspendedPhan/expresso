#ifndef EXPRESSO_EVALCONTEXT_H
#define EXPRESSO_EVALCONTEXT_H

#include <map>

class Organism;
class IntrinsicAttribute;

class OrganismEvalContext {
public:
    std::weak_ptr<OrganismOutput> organismOutput;
    int currentCloneNumber;
};


class EvalContext {
public:
    std::map<std::weak_ptr<Organism>, std::shared_ptr<OrganismEvalContext>, std::owner_less<std::weak_ptr<Organism>>> organismEvalContextByOrganism;
    std::map<std::weak_ptr<const IntrinsicAttribute>, float, std::owner_less<std::weak_ptr<const IntrinsicAttribute>>> valueByIntrinsicAttribute;
};

#endif //EXPRESSO_EVALCONTEXT_H
