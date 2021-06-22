//
// Created by Dylan on 6/4/2021.
//

#ifndef EXPRESSO_FUNCTIONPARAMETER_H
#define EXPRESSO_FUNCTIONPARAMETER_H


#include <string>

class FunctionParameter {
public:
    std::string id;
    std::string name;

    explicit FunctionParameter(std::string name);
    FunctionParameter(std::string id, std::string name);

    const std::string &getName() const;
};


#endif //EXPRESSO_FUNCTIONPARAMETER_H
