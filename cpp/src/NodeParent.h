//
// Created by Dylan on 6/22/2021.
//

#ifndef EXPRESSO_NODEPARENT_H
#define EXPRESSO_NODEPARENT_H
#include "variant.h"

class Node;
class Function;
class Attribute;

class NodeParent {
public:
    explicit NodeParent(const mpark::variant<Node *, Function *, Attribute *> &parent);

private:
    mpark::variant<Node *, Function *, Attribute *> parent;
public:
    bool isNode();
    bool isFunction();
    bool isAttribute();

    Node * getNode();
    Function * getFunction();
    Attribute * getAttribute();
};


#endif //EXPRESSO_NODEPARENT_H
