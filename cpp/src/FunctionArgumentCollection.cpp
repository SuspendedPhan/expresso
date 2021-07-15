//
// Created by Dylan on 7/13/2021.
//

#include "FunctionArgumentCollection.h"
#include "Node.h"

void FunctionArgumentCollection::setArgument(const FunctionParameter *parameter, std::unique_ptr<Node> node) {
    if (_owner == nullptr) {
        std::cerr << "FunctionArgumentCollection::setArgument error" << std::endl;
    }
    node->setParent(std::make_unique<NodeParent>(_owner));
    _argumentByParameter[parameter] = std::move(node);
    _owner->getOnChangedSignal()->dispatch();
}

Node *FunctionArgumentCollection::getArgument(const FunctionParameter *parameter) {
    return _argumentByParameter[parameter].get();
}

FunctionArgumentCollection::FunctionArgumentCollection(Node *owner) : _owner(owner) {}
