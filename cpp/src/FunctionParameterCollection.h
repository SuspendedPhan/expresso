//
// Created by Dylan on 7/13/2021.
//

#ifndef EXPRESSO_FUNCTIONPARAMETERCOLLECTION_H
#define EXPRESSO_FUNCTIONPARAMETERCOLLECTION_H


#include <vector>
#include "FunctionParameter.h"

class FunctionParameterCollection {
private:
    std::vector<std::unique_ptr<FunctionParameter>> _parameters;
public:
    std::vector<const FunctionParameter *> getAll();
    void add(std::unique_ptr<FunctionParameter> parameter);
};


#endif //EXPRESSO_FUNCTIONPARAMETERCOLLECTION_H
