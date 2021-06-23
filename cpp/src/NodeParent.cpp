//
// Created by Dylan on 6/22/2021.
//

#include "NodeParent.h"

NodeParent::NodeParent(const mpark::variant<Node *, Function *, Attribute *> &parent) : parent(parent) {}

bool NodeParent::isNode() {
    return mpark::holds_alternative<Node *>(this->parent);
}

bool NodeParent::isFunction() {
    return mpark::holds_alternative<Function *>(this->parent);
}

bool NodeParent::isAttribute() {
    return mpark::holds_alternative<Attribute *>(this->parent);
}

Node *NodeParent::getNode() {
    return mpark::getNode<Node *>(this->parent);
}

Function *NodeParent::getFunction() {
    return mpark::get<Function *>(this->parent);
}

Attribute *NodeParent::getAttribute() {
    return mpark::get<Attribute *>(this->parent);
}
