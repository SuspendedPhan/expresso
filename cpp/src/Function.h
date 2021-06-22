//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_FUNCTION_H
#define EXPRESSO_FUNCTION_H


#include <memory>
#include <vector>
#include "FunctionParameter.h"
#include "Node.h"

class Node;

class Function {
public:
    std::string id;
    std::string name;
    std::unique_ptr<Node> rootNode;
    std::vector<std::unique_ptr<FunctionParameter>> parameters;

    Function(std::string name, std::unique_ptr<Node> rootNode, std::string id);
    explicit Function(std::string name, std::unique_ptr<Node> rootNode);

    // Only use during construction.
    void addParameter(std::unique_ptr<FunctionParameter> parameter);
    std::vector<FunctionParameter *> getParameters();

    const std::string &getName() const;
};


#endif //EXPRESSO_FUNCTION_H
