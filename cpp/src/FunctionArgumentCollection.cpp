//
// Created by Dylan on 7/13/2021.
//

#include "FunctionArgumentCollection.h"
#include "Node.h"

void FunctionArgumentCollection::setArgument(const FunctionParameter *parameter, std::unique_ptr<Node> node) {
    _argumentByParameter[parameter] = std::move(node);
}

Node *FunctionArgumentCollection::getArgument(const FunctionParameter *parameter) {
    return _argumentByParameter[parameter].get();
}
