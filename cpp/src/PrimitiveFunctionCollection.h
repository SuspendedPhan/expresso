//
// Created by Dylan on 7/11/2021.
//

#ifndef EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H
#define EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H


#include <memory>
#include "PrimitiveFunction.h"

class PrimitiveFunctionCollection {
private:
    static std::unique_ptr<PrimitiveFunctionCollection> _instance;
    std::vector<std::unique_ptr<PrimitiveFunction>> _primitiveFunctions;
public:
    static const PrimitiveFunctionCollection * getInstance();
    std::vector<const PrimitiveFunction *> getFunctions() const;
};


#endif //EXPRESSO_PRIMITIVEFUNCTIONCOLLECTION_H
