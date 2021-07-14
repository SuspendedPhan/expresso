//
// Created by Dylan on 7/11/2021.
//

#ifndef EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H
#define EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H


#include <memory>
#include "PrimitiveFunction.h"

class PrimitiveFunctionCollection {
private:
    std::vector<std::unique_ptr<PrimitiveFunction>> _primitiveFunctions;
    void addFunctions();
};


#endif //EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H
