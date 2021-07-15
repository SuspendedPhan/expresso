//
// Created by Dylan on 7/13/2021.
//

#ifndef EXPRESSO_FUNCTIONARGUMENTCOLLECTION_H
#define EXPRESSO_FUNCTIONARGUMENTCOLLECTION_H


#include <map>
#include <memory>

class FunctionParameter;
class Node;

class FunctionArgumentCollection {
private:
    Node * _owner;
    std::map<const FunctionParameter *, std::unique_ptr<Node>> _argumentByParameter;
public:
    explicit FunctionArgumentCollection(Node *owner);

    void setArgument(const FunctionParameter * parameter, std::unique_ptr<Node> node);
    Node * getArgument(const FunctionParameter * parameter);
};


#endif //EXPRESSO_FUNCTIONARGUMENTCOLLECTION_H
