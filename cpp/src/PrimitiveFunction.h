//
// Created by Dylan on 7/11/2021.
//

#ifndef EXPRESSO_PRIMITIVEFUNCTION_H
#define EXPRESSO_PRIMITIVEFUNCTION_H


#include <string>
#include <functional>
#include <map>
#include <vector>
#include "Value.h"
#include "FunctionParameter.h"
#include "FunctionParameterCollection.h"

class PrimitiveFunction {
private:
    std::string id;
    std::string name;
    FunctionParameterCollection _parameters;
    std::function<Value(std::map<const FunctionParameter *, Value>)> eval;

public:
    PrimitiveFunction(std::string id, std::string name,
            std::vector<std::unique_ptr<FunctionParameter>> parameters,
            std::function<Value(std::map<const FunctionParameter *, Value>)> eval);

    const std::string &getId() const;
    const std::string &getName() const;
    const FunctionParameterCollection * getParameters() const;
};


#endif //EXPRESSO_PRIMITIVEFUNCTION_H
