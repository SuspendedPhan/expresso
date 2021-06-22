//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_FUNCTION_H
#define EXPRESSO_FUNCTION_H


#include <memory>
#include <vector>
#include "FunctionParameter.h"

class Node;

class Function {
public:
    std::unique_ptr<Node> rootNode;
    std::vector<std::unique_ptr<FunctionParameter>> parameters;
};


#endif //EXPRESSO_FUNCTION_H
