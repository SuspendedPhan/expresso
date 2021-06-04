//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_FUNCTION_H
#define EXPRESSO_FUNCTION_H


#include <memory>
#include "Node.h"
#include "FunctionParameter.h"

class Function {
    std::shared_ptr<Node> rootNode;
    std::vector<std::shared_ptr<FunctionParameter>> parameters;
};


#endif //EXPRESSO_FUNCTION_H
